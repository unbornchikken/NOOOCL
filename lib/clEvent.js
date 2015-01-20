var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');
var CLContext = require('./clContext');

//CLEvent

function CLEvent(cl, handle) {
    CLWrapper.call(this, cl, handle);
    this.profilingInfo = new CLEventProfilingInfo(cl, handle);
    this._promise = null;
}

util.inherits(CLEvent, CLWrapper);

Object.defineProperties(CLEvent.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetEventInfo';
        }
    },
    commandQueue: {
        get: function() {
            this._throwIfReleased();
            var CLCommandQueue = require('./clCommandQueue');
            return new CLCommandQueue(this.cl, this._getInfo(this.cl.types.CommandQueue, this.cl.defs.EVENT_COMMAND_QUEUE));
        }
    },
    context: {
        get: function() {
            this._throwIfReleased();
            return new CLContext(this.cl, this._getInfo(this.cl.types.Context, this.cl.defs.EVENT_CONTEXT));
        }
    },
    commandType: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandType, this.cl.defs.EVENT_COMMAND_TYPE);
        }
    },
    commandExecutionStatus: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandExecutionStatus, this.cl.defs.EVENT_COMMAND_EXECUTION_STATUS);
        }
    },
    promise: {
        get: function () {
            this._throwIfReleased();
            if (this._promise) return this._promise;
            var cl = this.cl;
            var defer;
            var p = new Promise(function (resolve, reject) {
                defer = {
                    resolve: resolve,
                    reject: reject
                };
            });
            var cb = cl.types.SetEventCallbackCallback.toPointer(function (h, err, data) {
                try {
                    cl.checkError(err);
                    if (err === 0) defer.resolve();
                }
                catch (e) {
                    defer.reject(e);
                }
            });
            var err = cl.imports.clSetEventCallback(this.handle, cl.defs.COMPLETE, cb, null);
            cl.checkError(err);
            return this._promise = p;
        }
    }
});

CLEvent.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseEvent(handle);
    };
};

// CLEventProfilingInfo

function CLEventProfilingInfo(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLEventProfilingInfo, CLWrapper);

Object.defineProperties(CLEventProfilingInfo.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetEventProfilingInfo';
        }
    },
    profilingCommandQueued: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_QUEUED);
        }
    },
    profilingCommandSubmit: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_SUBMIT);
        }
    },
    profilingCommandStart: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_START);
        }
    },
    profilingCommandEnd: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_END);
        }
    }
});

CLEventProfilingInfo.prototype.createReleaseMethod = function () {
    return null;
};

module.exports = CLEvent;
