"use strict";

var CLWrapper = require("./clWrapper");
var util = require("util");
var _ = require("lodash");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var clUtils = require("./clUtils");
var KernelArg = require("./kernelArg");
var assert = require("assert");

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseKernel(handle);
    });
}

function CLKernel1(program, name) {
    var cl = program.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateKernel(clUtils.toHandle(program), name, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
    this.propgram = program;
    this._name = name;
}

function CLKernel2(program, handle) {
    var cl = program.cl;
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
    this.propgram = program;
    this._name = null;
}

function CLKernel() {
    if (_.isString(arguments[1])) {
        CLKernel1.apply(this, arguments);
    }
    else {
        CLKernel2.apply(this, arguments);
    }
    this._args = [];
}

util.inherits(CLKernel, CLWrapper);

Object.defineProperties(CLKernel.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetKernelInfo";
        }
    },
    name: {
        get: function () {
            return this._name ? this._name : this._getStringInfo(this.cl.defs.CL_KERNEL_FUNCTION_NAME);
        }
    },
    context: {
        get: function () {
            return this.program.context;
        }
    },
    numArgs: {
        get: function () {
            return this._getInfo("uint", this.cl.defs.CL_KERNEL_NUM_ARGS);
        }
    }
});

CLKernel.prototype.getWorkgroupSize = function (device) {
    return this._getInfo2("size_t", this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.CL_KERNEL_WORK_GROUP_SIZE);
};

CLKernel.prototype.getCompileWorkGroupSize = function (device) {
    return this._getArrayInfo2("size_t", this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.CL_KERNEL_COMPILE_WORK_GROUP_SIZE);
};

CLKernel.prototype.getLocalMemSize = function (device) {
    return this._getInfo2("ulong", this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.CL_KERNEL_LOCAL_MEM_SIZE);
};

CLKernel.prototype.getPreferredWorkGroupSizeMultiple = function (device) {
    return this._getInfo2("size_t", this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.CL_KERNEL_PREFERRED_WORK_GROUP_SIZE_MULTIPLE);
};

CLKernel.prototype.getPrivateMemSize = function (device) {
    return this._getInfo2("ulong", this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.CL_KERNEL_PRIVATE_MEM_SIZE);
};

CLKernel.prototype.setArg = function (index, value, type) {
    assert(_.isNumber(index), "Argument 'index' is not a number.");
    assert(index >= 0 && index < 2048, "Argument 'index' is out of range.");

    while (this._args.length <= index) {
        this._args.push(null);
    }
    if (_.isPlainObject(value) && _.isUndefined(type)) {
        // Supporting formats like: { "int": 55 }
        for (var k in value) {
            if (value.hasOwnProperty(k)) {
                type = k;
                break;
            }
        }
        if (type) {
            value = value[type];
        }
    }
    if (this._args[index] === null) {
        this._args[index] = new KernelArg(this, index, value, type);
    }
    else {
        this._args[index].value = value;
    }
};

CLKernel.prototype.setArgs = function () {
    var self = this;
    _.forEach(_.isArray(arguments[0]) ? arguments[0] : arguments, function (arg, i) {
        self.setArg(i, arg);
    });
};

CLKernel.prototype.bind = function (queue, globalRange, localRange, offset) {
    return function () {
        this.setArgs.apply(this, arguments);
        queue.waitable(false).enqueueNDRangeKernel(this, globalRange, localRange, offset);
    }.bind(this);
};

module.exports = CLKernel;
