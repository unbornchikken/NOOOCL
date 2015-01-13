var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');

function CLEvent(cl, handle) {
    var defer;
    Promise.call(this, function(resolve, reject) {
        defer = {
            resolve: resolve,
            reject: reject
        };
    });
    var cb = cl.types.SetEventCallbackCallback.toPointer(function(h, err) {
        try {
            cl.checkError(err);
            if (err === 0) defer.resolve();
        }
        catch (e) {
            defer.reject(e);
        }
    });
    var err = cl.imports.clSetEventCallback(handle, cl.defs.COMPLETE, cb, null);
    cl.checkError(err);
    this.info = new CLEventInfo(cl, handle);
    this.profilingInfp = new CLEventProfilingInfo(cl, handle);
}

util.inherits(CLEvent, Promise);

function CLEventInfo(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLEventInfo, CLWrapper);

Object.defineProperties(CLEventInfo.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetEventInfo';
        }
    }
});

CLEventInfo.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseEvent(handle);
    };
};

function CLEventProfilingInfo(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLEventProfilingInfo, CLWrapper);

Object.defineProperties(CLEventProfilingInfo.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetEventProfilingInfo';
        }
    }
});
