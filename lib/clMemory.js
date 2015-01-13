var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');
var assert = require('assert');

function CLMemory(context, handle) {
    CLWrapper.call(this, context.cl, handle);
    this.context = context;
}

util.inherits(CLMemory, CLWrapper);

Object.defineProperties(CLMemory.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetMemObjectInfo';
        }
    },
    mapCount: {
        get: function() {
            return this._getInfo('uint', this.cl.defs.MEM_MAP_COUNT);
        }
    },
    hostPtr: {
        get: function() {
            return this._getInfo('pointer', this.cl.defs.MEM_HOST_PTR);
        }
    },
    size: {
        get: function() {
            return this._getInfo('size_t', this.cl.defs.MEM_SIZE);
        }
    },
    memFlags: {
        get: function() {
            return this._getInfo(this.cl.types.MemFlags, this.cl.defs.MEM_FLAGS);
        }
    }
});

CLMemory.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseMemObject(handle);
    };
};

CLMemory.prototype.setDestructorCallback = function (cb) {
    assert(_.isFunction(cb));
    var err = this.cl.imports.setDestructorCallback(this.handle, this.cl.types.MemObjectDestructorCallback.toPointer(cb), null);
    this.cl.checkError(err);
};

CLMemory.prototype.getGLObjectInfo = function() {
    var gl_object_type = ref.alloc('uint');
    var gl_object_name = ref.alloc('uint');
    var err = this.cl.imports.clGetGLObjectInfo(gl_object_type, gl_object_name);
    this.cl.checkError(err);
    return {
        glObjectType: gl_object_type.deref(),
        glObjectName: gl_object_name.deref()
    };
}
