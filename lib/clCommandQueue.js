var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');

function CLCommandQueue(context, device, outOfOrder, profiling) {
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
    }
});

CLCommandQueue.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseCommandQueue(handle);
    };
};