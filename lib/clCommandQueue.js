var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');
var CLEvent = require('./clEvent');
var CLContext = require('./clContext');
var CLDevice = require('./clDevice');
var NDRange = require('./ndRange');
var assert = require('assert');

function CLCommandQueue() {
    if (arguments.length >= 2 && arguments[0] instanceof CLContext && arguments[1] instanceof CLDevice) {
        CLCommandQueue2.apply(this, arguments);
    }
    else {
        CLCommandQueue1.apply(this, arguments);
    }
}

function CLCommandQueue1(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

function CLCommandQueue2(context, device, outOfOrder, profiling) {
    var cl = context.cl;
    outOfOrder = _.isBoolean(outOfOrder) ? outOfOrder : false;
    profiling = _.isBoolean(profiling) ? profiling : false;
    var err = ref.alloc(cl.types.ErrorCode);

    var handle = cl.imports.clCreateCommandQueue(
        context.handle,
        device.handle,
        (outOfOrder ? cl.defs.QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE : 0) | (profiling ? cl.defs.QUEUE_PROFILING_ENABLE : 0),
        err);
    cl.checkError(err);

    CLWrapper.call(this, cl, handle);
}

util.inherits(CLCommandQueue, CLWrapper);

Object.defineProperties(CLCommandQueue.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetCommandQueueInfo';
        }
    },
    context: {
        get: function() {
            this._throwIfReleased();
            return new CLContext(this.cl, this._getInfo(this.cl.types.Context, this.cl.defs.QUEUE_CONTEXT));
        }
    },
    device: {
        get: function() {
            this._throwIfReleased();
            return new CLDevice(this.cl, this._getInfo(this.cl.types.DeviceId, this.cl.defs.QUEUE_DEVICE));
        }
    },
    properties: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandQueueProperties, this.cl.defs.QUEUE_PROPERTIES);
        }
    },
    isOutOfOrder: {
        get: function() {
            this._throwIfReleased();
            return (this.properties & this.cl.defs.QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE) ? true : false;
        }
    },
    isProfilingEnabled: {
        get: function() {
            this._throwIfReleased();
            return (this.properties & this.cl.defs.QUEUE_PROFILING_ENABLE) ? true : false;
        }
    }
});

CLCommandQueue.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseCommandQueue(handle);
    };
};

CLCommandQueue.prototype.flush = function() {
    this._throwIfReleased();
    var err = this.cl.imports.clFlush(this.handle);
    this.cl.checkError(err);
};

CLCommandQueue.prototype.enqueueWaitForEvents = function(events) {
    this._throwIfReleased();
    if (!events.length) return;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueWaitForEvents(this.handle, waitList.count, waitList.array);
    this.cl.checkError(err);
};

CLCommandQueue.prototype.enqueueTask = function(waitable, kernel, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueTask(this.handle, kernel.handle, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueMarker = function() {
    this._throwIfReleased();
    var event = ref.alloc(this.cl.types.Event);
    var err = this.cl.imports.clEnqueueMarker(this.handle, event);
    this.cl.checkError(err);
    return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueBarrier = function() {
    this._throwIfReleased();
    var err = this.cl.imports.clEnqueueBarrier(this.handle);
    this.cl.checkError(err);
};

CLCommandQueue.prototype.enqueueNDRangeKernel = function(waitable, kernel, globalRange, localRange, offset, events) {
    this._throwIfReleased();
    globalRange = globalRange || NDRange.nullRange;
    localRange = localRange || NDRange.nullRange;
    offset = offset || NDRange.nullRange;
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueNDRangeKernel(this.handle, kenrel.handle, globalRange.dimensions, offset.sizes, globalRange.sizes, localRange.sizes, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype._enqueueReadWriteBuffer = function(func, waitable, buffer, offset, size, ptr, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = func(this.handle, buffer.handle, false, offset, size, ptr, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueReadBuffer = function(waitable, buffer, offset, size, ptr, events) {
    return this._enqueueReadWriteBuffer(this.cl.imports.clEnqueueReadBuffer, waitable, buffer, offset, size, ptr, events);
};

CLCommandQueue.prototype.enqueueWriteBuffer = function(waitable, buffer, offset, size, ptr, events) {
    return this._enqueueReadWriteBuffer(this.cl.imports.clEnqueueWriteBuffer, waitable, buffer, offset, size, ptr, events);
};

CLCommandQueue.prototype.enqueueMapBuffer = function(waitable, buffer, flags, offset, size, out, events) {
    this._throwIfReleased();
    assert(_.isObject(out), 'Out must be an object.');
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = ref.alloc(this.cl.types.ErrorCode);
    var ptr = this.cl.imports.clEnqueueMapBuffer(this.handle, buffer.handle, false, flags, offset, size, waitList.count, waitList.array, event, err);
    this.cl.checkError(err);
    out.ptr = ptr;
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueMapImage = function(waitable, image, flags, origin, region, out, events) {
    this._throwIfReleased();
    assert(_.isObject(out), 'Out must be an object.');
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = ref.alloc(this.cl.types.ErrorCode);
    var rowPitch = ref.alloc('size_t');
    var slicePitch = ref.alloc('size_t');
    var ptr = this.cl.imports.clEnqueueMapImage(this.handle, buffer.handle, false, flags, origin.sizes, origin.sizes, rowPitch, slicePitch, waitList.count, waitList.array, event, err);
    this.cl.checkError(err);
    out.ptr = ptr;
    out.rowPitch = rowPitch.deref();
    out.slicePitch = slicePitch.deref();
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueUnmapMemory = function(waitable, memory, ptr, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueUnmapMemObject(this.handle, memory.handle, ptr, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueAcquireGLObjects = function() {
    this._throwIfReleased();
    throw new Error('TODO');
};

CLCommandQueue.prototype.enqueueReleaseGLObjects = function() {
    this._throwIfReleased();
    throw new Error('TODO');
};

CLCommandQueue.prototype._enqueueReadWriteImage = function(func, waitable, image, origin, region, ptr, rowPitch, slicePitch, events) {
    this._throwIfReleased();
    rowPitch = rowPitch || 0;
    slicePitch = slicePitch || 0;

    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = func(this.handle, image.handle, false, origin.sizes, region.sizes, rowPitch, slicePitch, ptr, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueReadImage = function(waitable, image, origin, region, ptr, rowPitch, slicePitch, events) {
    return this._enqueueReadWriteImage(this.cl.imports.clEnqueueReadImage, waitable, image, origin, region, ptr, rowPitch, slicePitch, events);
};

CLCommandQueue.prototype.enqueueWriteImage = function(waitable, image, origin, region, ptr, rowPitch, slicePitch, events) {
    return this._enqueueReadWriteImage(this.cl.imports.clEnqueueWriteImage, waitable, image, origin, region, ptr, rowPitch, slicePitch, events);
};

CLCommandQueue.prototype.enqueueCopyBuffer = function(waitable, srcBuffer, dstBuffer, srcOffset, dstOffset, size, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyBuffer(this.handle, srcBuffer.handle, dstBuffer.handle, srcOffset, dstOffset, size, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueCopyImage = function(waitable, srcImage, dstImage, srcOrigin, dstOrigin, region, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyImage(this.handle, srcImage.handle, dstImage.handle, srcOrigin.sizes, dstOrigin.sizes, region.sizes, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueCopyImageToBuffer = function(waitable, srcImage, dstBuffer, srcOrigin, region, dstOffset, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyImageToBuffer(this.handle, srcImage.handle, dstBuffer.handle, srcOrigin.sizes, region.sizes, dstOffset, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueCopyBufferToImage = function(waitable, srcBuffer, dstImage, srcOffset, dstOrigin, region, events) {
    this._throwIfReleased();
    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyImageToBuffer(this.handle, srcBuffer.handle, dstImage.handle, srcOffset, dstOrigin.sizes, region.sizes, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype._enqueueReadWriteBufferRect = function(func, waitable, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events) {
    this._throwIfReleased();

    bufferRowPitch = bufferRowPitch || 0;
    bufferSlicePitch = bufferSlicePitch || 0;
    hostRowPitch = hostRowPitch || 0;
    hostSlicePitch = hostSlicePitch || 0;

    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = func(this.handle, buffer.handle, false, bufferOrigin.sizes, hostOrigin.sizes, region.sizes, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, ptr, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueReadBufferRect = function(waitable, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events) {
    return this._enqueueReadWriteBufferRect(this.cl.imports.clEnqueueReadBufferRect, waitable, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events);
};

CLCommandQueue.prototype.enqueueWriteBufferRect = function(waitable, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events) {
    return this._enqueueReadWriteBufferRect(this.cl.imports.clEnqueueWriteBufferRect, waitable, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events);
};

CLCommandQueue.prototype.enqueueCopyBufferRect = function(waitable, srcBuffer, dstBuffer, srcOrigin, dstOrigin, region, srcRowPitch, srcSlicePitch, dstRowPitch, dstSlicePitch, events) {
    this._throwIfReleased();

    srcRowPitch = srcRowPitch || 0;
    srcSlicePitch = srcSlicePitch || 0;
    dstRowPitch = dstRowPitch || 0;
    dstSlicePitch = dstSlicePitch || 0;

    var event = waitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyBufferRect(this.handle, srcBuffer.handle, dstBuffer.handle, srcOrigin.sizes, dstOrigin.sizes, region.sizes, srcRowPitch, srcSlicePitch, dstRowPitch, dstSlicePitch, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) return new CLEvent(this.cl, event.deref());
};

function toWaitList(events) {
    if (events && events.length) {
        var array = new (this.cl.types.EventArray)(events.length);
        for (var i = 0; i < events.length; i++) {
            array[i] = events[i].handle;
        }
        return {
            count: events.length,
            array: array
        };
    }
    else {
        return {
            count: 0,
            array: null
        };
    }
}

module.exports = CLCommandQueue;