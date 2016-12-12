"use strict";

var CLWrapper = require("./clWrapper");
var util = require("util");
var CLContext = require("./clContext");
var Bluebird = require("bluebird");
var assert = require("assert");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var clUtils = require("./clUtils");

var CLCommandQueue = null;

// CLEventProfilingInfo

function CLEventProfilingInfo(cl, handle) {
    CLWrapper.call(this, cl, handle, null);
}

util.inherits(CLEventProfilingInfo, CLWrapper);

Object.defineProperties(CLEventProfilingInfo.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetEventProfilingInfo";
        }
    },
    profilingCommandQueued: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("ulong", this.cl.defs.CL_PROFILING_COMMAND_QUEUED, true);
        }
    },
    profilingCommandSubmit: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("ulong", this.cl.defs.CL_PROFILING_COMMAND_SUBMIT, true);
        }
    },
    profilingCommandStart: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("ulong", this.cl.defs.CL_PROFILING_COMMAND_START, true);
        }
    },
    profilingCommandEnd: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("ulong", this.cl.defs.CL_PROFILING_COMMAND_END, true);
        }
    }
});

//CLEvent

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseEvent(handle);
    });
}

function CLEvent(cl, handle) {
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
    this.profilingInfo = new CLEventProfilingInfo(cl, handle);
    this._promise = null;
    this._cb = null;
    this._icb = null;
}

util.inherits(CLEvent, CLWrapper);

Object.defineProperties(CLEvent.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetEventInfo";
        }
    },
    commandQueue: {
        get: function () {
            this._throwIfReleased();
            CLCommandQueue = CLCommandQueue || (CLCommandQueue = require("./clCommandQueue"));
            return new CLCommandQueue(this.cl, this._getInfo(this.cl.types.CommandQueue, this.cl.defs.CL_EVENT_COMMAND_QUEUE));
        }
    },
    context: {
        get: function () {
            this._throwIfReleased();
            return new CLContext(this.cl, this._getInfo(this.cl.types.Context, this.cl.defs.CL_EVENT_CONTEXT));
        }
    },
    commandType: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandType, this.cl.defs.CL_EVENT_COMMAND_TYPE);
        }
    },
    commandExecutionStatus: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandExecutionStatus, this.cl.defs.CL_EVENT_COMMAND_EXECUTION_STATUS, true);
        }
    },
    promise: {
        get: function () {
            var self = this;
            self._throwIfReleased();
            if (self._promise) {
                return self._promise;
            }
            var cl = self.cl;
            var defer;
            self._promise = new Bluebird(function (resolve, reject) {
                defer = {
                    resolve: resolve,
                    reject: reject
                };
            });
            this._icb = function (h, err2, data) {
                try {
                    cl.checkError(err2);
                    if (err2 === 0) {
                        defer.resolve();
                    }
                }
                catch (e) {
                    defer.reject(e);
                }
            };
            this._cb = cl.types.SetEventCallbackCallback.toPointer(this._icb);
            var err = cl.imports.clSetEventCallback(self.handle, cl.defs.CL_COMPLETE, this._cb, null);
            cl.checkError(err);
            self._promise = self._promise.finally(function() {
                setImmediate(function () {
                    self.release();
                });
            });
            self._promise = clUtils.keepAlive(self._promise);
            return self._promise;
        }
    }
});

module.exports = CLEvent;
