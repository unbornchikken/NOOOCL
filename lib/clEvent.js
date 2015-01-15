var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');
var CLContext = require('./clContext');

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

//CLEventInfo

function CLEventInfo(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLEventInfo, CLWrapper);

Object.defineProperties(CLEventInfo.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetEventInfo';
        }
    },
    commandQueue: {
        get: function() {
            var CLCommandQueue = require('./clCommandQueue');
            return new CLCommandQueue(this.cl, this._getInfo(this.cl.types.CommandQueue, this.cl.defs.EVENT_COMMAND_QUEUE));
        }
    },
    context: {
        get: function() {
            return new CLContext(this.cl, this._getInfo(this.cl.types.Context, this.cl.defs.EVENT_CONTEXT));
        }
    },
    commandType: {
        get: function() {
            return this._getInfo(this.cl.types.CommandType, this.cl.defs.EVENT_COMMAND_TYPE);
        }
    },
    commandExecutionStatus: {
        get: function() {
            return this._getInfo(this.cl.types.CommandExecutionStatus, this.cl.defs.EVENT_COMMAND_EXECUTION_STATUS);
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
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_QUEUED);
        }
    },
    profilingCommandSubmit: {
        get: function() {
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_SUBMIT);
        }
    },
    profilingCommandStart: {
        get: function() {
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_START);
        }
    },
    profilingCommandEnd: {
        get: function() {
            return this._getInfo('ulong', this.cl.defs.PROFILING_COMMAND_END);
        }
    }
});
