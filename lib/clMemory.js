"use strict";

var CLWrapper = require("./clWrapper");
var util = require("util");
var _ = require("lodash");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var assert = require("assert");

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseMemObject(handle);
    });
}

function CLMemory(context, handle) {
    CLWrapper.call(this, context.cl, handle, createReleaseFunction(context.cl, handle));
    this.context = context;
}

util.inherits(CLMemory, CLWrapper);

Object.defineProperties(CLMemory.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetMemObjectInfo";
        }
    },
    mapCount: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("uint", this.cl.defs.CL_MEM_MAP_COUNT);
        }
    },
    hostPtr: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("pointer", this.cl.defs.CL_MEM_HOST_PTR);
        }
    },
    size: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("size_t", this.cl.defs.CL_MEM_SIZE);
        }
    },
    memFlags: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.MemFlags, this.cl.defs.CL_MEM_FLAGS);
        }
    }
});

CLMemory.prototype.setDestructorCallback = function (cb) {
    this._throwIfReleased();
    assert(_.isFunction(cb));
    var err = this.cl.imports.setDestructorCallback(this.handle, this.cl.types.MemObjectDestructorCallback.toPointer(cb), null);
    this.cl.checkError(err);
};

CLMemory.prototype.getGLObjectInfo = function () {
    this._throwIfReleased();
    var gl_object_type = ref.alloc("uint");
    var gl_object_name = ref.alloc("uint");
    var err = this.cl.imports.clGetGLObjectInfo(gl_object_type, gl_object_name);
    this.cl.checkError(err);
    return {
        glObjectType: gl_object_type.deref(),
        glObjectName: gl_object_name.deref()
    };
};

module.exports = CLMemory;
