"use strict";

var CLWrapper = require("./clWrapper");
var util = require("util");
var _ = require("lodash");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var CLEvent = require("./clEvent");
var CLContext = require("./clContext");
var CLDevice = require("./clDevice");
var NDRange = require("./ndRange");
var assert = require("assert");
var clUtils = require("./clUtils");

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseCommandQueue(handle);
    });
}

function CLCommandQueue1(cl, handle) {
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
}

function CLCommandQueue2(context, device, outOfOrder, profiling) {
    var cl = context.cl;
    outOfOrder = _.isBoolean(outOfOrder) ? outOfOrder : false;
    profiling = _.isBoolean(profiling) ? profiling : false;
    var err = ref.alloc(cl.types.ErrorCode);

    var handle = cl.imports.clCreateCommandQueue(
        clUtils.toHandle(context),
        clUtils.toHandle(device),
        (outOfOrder ? cl.defs.CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE : 0) | (profiling ? cl.defs.CL_QUEUE_PROFILING_ENABLE : 0),
        err);
    cl.checkError(err);

    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
}

function CLCommandQueue() {
    if (arguments.length >= 2 && arguments[0] instanceof CLContext && arguments[1] instanceof CLDevice) {
        CLCommandQueue2.apply(this, arguments);
    }
    else {
        CLCommandQueue1.apply(this, arguments);
    }
    this.isWaitable = false;
    this._notWaitableVersion = this;
    this._waitableVersion = null;
}

util.inherits(CLCommandQueue, CLWrapper);

Object.defineProperties(CLCommandQueue.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetCommandQueueInfo";
        }
    },
    context: {
        get: function () {
            this._throwIfReleased();
            return new CLContext(this.cl, this._getInfo(this.cl.types.Context, this.cl.defs.CL_QUEUE_CONTEXT));
        }
    },
    device: {
        get: function () {
            this._throwIfReleased();
            return new CLDevice(this.cl, this._getInfo(this.cl.types.DeviceId, this.cl.defs.CL_QUEUE_DEVICE));
        }
    },
    properties: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandQueueProperties, this.cl.defs.CL_QUEUE_PROPERTIES);
        }
    },
    isOutOfOrder: {
        get: function () {
            this._throwIfReleased();
            return (this.properties & this.cl.defs.CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE) ? true : false;
        }
    },
    isProfilingEnabled: {
        get: function () {
            this._throwIfReleased();
            return (this.properties & this.cl.defs.CL_QUEUE_PROFILING_ENABLE) ? true : false;
        }
    },
    waitableVersion: {
        get: function () {
            this._throwIfReleased();
            if (!this._waitableVersion) {
                var err = this.cl.imports.clRetainCommandQueue(this.handle);
                this.cl.checkError(err);
                try {
                    var newQueue = new CLCommandQueue(this.cl, this.handle);
                    newQueue.isWaitable = true;
                    newQueue._notWaitableVersion = this;
                    newQueue._waitableVersion = newQueue;
                    this._waitableVersion = newQueue;
                }
                catch (e) {
                    this.cl.imports.clReleaseCommandQueue(this.handle);
                    throw e;
                }
            }
            return this._waitableVersion;
        }
    },
    notWaitableVersion: {
        get: function () {
            this._throwIfReleased();
            return this._notWaitableVersion;
        }
    }
});

CLCommandQueue.prototype._toWaitList = function (events) {
    if (events && events.length) {
        var array = new (this.cl.types.EventArray)(events.length);
        for (var i = 0; i < events.length; i++) {
            array.set(i, clUtils.toHandle(events[i]));
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
};

CLCommandQueue.prototype.waitable = function (value) {
    value = (value || true) ? true : false;
    if (this.isWaitable === value) {
        return this;
    }
    return value ? this.waitableVersion : this.notWaitableVersion;
};

CLCommandQueue.prototype.flush = function () {
    this._throwIfReleased();
    var err = this.cl.imports.clFlush(this.handle);
    this.cl.checkError(err);
};

CLCommandQueue.prototype.enqueueWaitForEvents = function (events) {
    this._throwIfReleased();
    if (!events.length) {
        return;
    }
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueWaitForEvents(this.handle, waitList.count, waitList.array);
    this.cl.checkError(err);
};

CLCommandQueue.prototype.enqueueTask = function (kernel, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueTask(this.handle, clUtils.toHandle(kernel), waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueMarker = function () {
    this._throwIfReleased();
    var event = ref.alloc(this.cl.types.Event);
    var err = this.cl.imports.clEnqueueMarker(this.handle, event);
    this.cl.checkError(err);
    return new CLEvent(this.cl, event.deref());
};

CLCommandQueue.prototype.enqueueBarrier = function () {
    this._throwIfReleased();
    var err = this.cl.imports.clEnqueueBarrier(this.handle);
    this.cl.checkError(err);
};

CLCommandQueue.prototype.enqueueNDRangeKernel = function (kernel, globalRange, localRange, offset, events) {
    this._throwIfReleased();
    globalRange = globalRange || NDRange.nullRange;
    localRange = localRange || NDRange.nullRange;
    offset = offset || NDRange.nullRange;
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueNDRangeKernel(this.handle, clUtils.toHandle(kernel), globalRange.dimensions, offset.sizes, globalRange.sizes, localRange.sizes, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype._enqueueReadWriteBuffer = function (func, buffer, offset, size, ptr, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = func(this.handle, clUtils.toHandle(buffer), false, offset, size, clUtils.toPtr(ptr), waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueReadBuffer = function (buffer, offset, size, ptr, events) {
    return this._enqueueReadWriteBuffer(this.cl.imports.clEnqueueReadBuffer, buffer, offset, size, ptr, events);
};

CLCommandQueue.prototype.enqueueWriteBuffer = function (buffer, offset, size, ptr, events) {
    return this._enqueueReadWriteBuffer(this.cl.imports.clEnqueueWriteBuffer, buffer, offset, size, ptr, events);
};

CLCommandQueue.prototype.enqueueMapBuffer = function (buffer, flags, offset, size, out, events) {
    this._throwIfReleased();
    assert(_.isObject(out), "Out must be an object.");
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = ref.alloc(this.cl.types.ErrorCode);
    var ptr = this.cl.imports.clEnqueueMapBuffer(this.handle, clUtils.toHandle(buffer), false, flags, offset, size, waitList.count, waitList.array, event, err);
    this.cl.checkError(err);
    out.ptr = ptr;
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueMapImage = function (image, flags, origin, region, out, events) {
    this._throwIfReleased();
    assert(_.isObject(out), "Out must be an object.");
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = ref.alloc(this.cl.types.ErrorCode);
    var rowPitch = ref.alloc("size_t");
    var slicePitch = ref.alloc("size_t");
    var ptr = this.cl.imports.clEnqueueMapImage(this.handle, clUtils.toHandle(image), false, flags, origin.sizes, region.sizes, rowPitch, slicePitch, waitList.count, waitList.array, event, err);
    this.cl.checkError(err);
    out.ptr = ptr;
    out.rowPitch = rowPitch.deref();
    out.slicePitch = slicePitch.deref();
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueUnmapMemory = function (memory, ptr, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueUnmapMemObject(this.handle, clUtils.toHandle(memory), ptr, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueAcquireGLObjects = function () {
    this._throwIfReleased();
    throw new Error("TODO");
};

CLCommandQueue.prototype.enqueueReleaseGLObjects = function () {
    this._throwIfReleased();
    throw new Error("TODO");
};

CLCommandQueue.prototype._enqueueReadWriteImage = function (func, image, origin, region, ptr, rowPitch, slicePitch, events) {
    this._throwIfReleased();
    rowPitch = rowPitch || 0;
    slicePitch = slicePitch || 0;

    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = func(this.handle, clUtils.toHandle(image), false, origin.sizes, region.sizes, rowPitch, slicePitch, clUtils.toPtr(ptr), waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueReadImage = function (image, origin, region, ptr, rowPitch, slicePitch, events) {
    return this._enqueueReadWriteImage(this.cl.imports.clEnqueueReadImage, image, origin, region, ptr, rowPitch, slicePitch, events);
};

CLCommandQueue.prototype.enqueueWriteImage = function (image, origin, region, ptr, rowPitch, slicePitch, events) {
    return this._enqueueReadWriteImage(this.cl.imports.clEnqueueWriteImage, image, origin, region, ptr, rowPitch, slicePitch, events);
};

CLCommandQueue.prototype.enqueueCopyBuffer = function (srcBuffer, dstBuffer, srcOffset, dstOffset, size, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyBuffer(this.handle, clUtils.toHandle(srcBuffer), clUtils.toHandle(dstBuffer), srcOffset, dstOffset, size, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueCopyImage = function (srcImage, dstImage, srcOrigin, dstOrigin, region, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyImage(this.handle, clUtils.toHandle(srcImage), clUtils.toHandle(dstImage), srcOrigin.sizes, dstOrigin.sizes, region.sizes, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueCopyImageToBuffer = function (srcImage, dstBuffer, srcOrigin, region, dstOffset, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyImageToBuffer(this.handle, clUtils.toHandle(srcImage), clUtils.toHandle(dstBuffer), srcOrigin.sizes, region.sizes, dstOffset, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueCopyBufferToImage = function (srcBuffer, dstImage, srcOffset, dstOrigin, region, events) {
    this._throwIfReleased();
    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyImageToBuffer(this.handle, clUtils.toHandle(srcBuffer), clUtils.toHandle(dstImage), srcOffset, dstOrigin.sizes, region.sizes, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype._enqueueReadWriteBufferRect = function (func, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events) {
    this._throwIfReleased();

    bufferRowPitch = bufferRowPitch || 0;
    bufferSlicePitch = bufferSlicePitch || 0;
    hostRowPitch = hostRowPitch || 0;
    hostSlicePitch = hostSlicePitch || 0;

    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = func(this.handle, clUtils.toHandle(buffer), false, bufferOrigin.sizes, hostOrigin.sizes, region.sizes, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, clUtils.toPtr(ptr), waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

CLCommandQueue.prototype.enqueueReadBufferRect = function (buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events) {
    return this._enqueueReadWriteBufferRect(this.cl.imports.clEnqueueReadBufferRect, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events);
};

CLCommandQueue.prototype.enqueueWriteBufferRect = function (buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events) {
    return this._enqueueReadWriteBufferRect(this.cl.imports.clEnqueueWriteBufferRect, buffer, bufferOrigin, hostOrigin, region, ptr, bufferRowPitch, bufferSlicePitch, hostRowPitch, hostSlicePitch, events);
};

CLCommandQueue.prototype.enqueueCopyBufferRect = function (srcBuffer, dstBuffer, srcOrigin, dstOrigin, region, srcRowPitch, srcSlicePitch, dstRowPitch, dstSlicePitch, events) {
    this._throwIfReleased();

    srcRowPitch = srcRowPitch || 0;
    srcSlicePitch = srcSlicePitch || 0;
    dstRowPitch = dstRowPitch || 0;
    dstSlicePitch = dstSlicePitch || 0;

    var event = this.isWaitable ? ref.alloc(this.cl.types.Event) : null;
    var waitList = this._toWaitList(events);
    var err = this.cl.imports.clEnqueueCopyBufferRect(this.handle, clUtils.toHandle(srcBuffer), clUtils.toHandle(dstBuffer), srcOrigin.sizes, dstOrigin.sizes, region.sizes, srcRowPitch, srcSlicePitch, dstRowPitch, dstSlicePitch, waitList.count, waitList.array, event);
    this.cl.checkError(err);
    if (event) {
        return new CLEvent(this.cl, event.deref());
    }
};

module.exports = CLCommandQueue;