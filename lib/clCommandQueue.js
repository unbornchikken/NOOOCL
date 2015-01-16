var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');
var CLEvent = require('./clEvent');
var CLContext = require('./clContext');
var CLDevice = require('./clDevice');

function CLCommandQueue() {
    if (arguments.length === 2) {
        CLCommandQueue1.apply(this, arguments);
    }
    else {
        CLCommandQueue2.apply(this, arguments);
    }
}

function CLCommandQueue1(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

function CLCommandQueue2(context, device, outOfOrder, profiling) {
    var cl = context.cl;
    outOfOrder = _.isBoolean(outOfOrder) ? outOfOrder : false;
    profiling = _.isBoolean(profiling) ? profiling : false;
    var err = ref.alloc(cl.types.ErrorCodeRet);

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
    if (event) return new CLEvent(this.cl, event);
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