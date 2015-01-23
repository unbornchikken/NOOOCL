var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var NDRange = require('./ndRange');
var clUtils = require('./clUtils');
var LocalSize = require('./localSize');
var KernelArg = require('./kernelArg');
var assert = require('assert');

function CLKernel(program, name) {
    var cl = program.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateKernel(clUtils.toHandle(program), name, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle);
    this.propgram = program;
    this.name = name;
    this._args = [];
}

util.inherits(CLKernel, CLWrapper);

Object.defineProperties(CLKernel.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetKernelInfo';
        }
    },
    context: {
        get: function () {
            return this.program.context;
        }
    },
    numArgs: {
        get: function () {
            return this._getInfo('uint', this.cl.defs.KERNEL_NUM_ARGS);
        }
    }
});

CLKernel.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseKernel(handle);
    };
};

CLKernel.prototype.getWorkgroupSize = function (device) {
    return this._getInfo2('size_t', this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.KERNEL_WORK_GROUP_SIZE);
};

CLKernel.prototype.getCompileWorkGroupSize = function (device) {
    return this._getArrayInfo2('size_t', this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.KERNEL_COMPILE_WORK_GROUP_SIZE);
};

CLKernel.prototype.getLocalMemSize = function (device) {
    return this._getInfo2('ulong', this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.KERNEL_LOCAL_MEM_SIZE);
};

CLKernel.prototype.preferredWorkGroupSizeMultiple = function (device) {
    return this._getInfo2('size_t', this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.KERNEL_PREFERRED_WORK_GROUP_SIZE_MULTIPLE);
};

CLKernel.prototype.privateMemSize = function (device) {
    return this._getInfo2('ulong', this.cl.imports.clGetKernelWorkGroupInfo, device, this.cl.defs.KERNEL_PRIVATE_MEM_SIZE);
};

CLKernel.prototype.setArg = function(index, value, type) {
    assert(_.isNumber(index), 'Argument "index" is not a number.');
    assert(index >= 0 && index < 2048, 'Argument "index" is out of range.');

    while(this._args.length < index) {
        this._args.push(null);
    }
    if (this._args[index] === null) {
        this._args[index] = new KernelArg(this, index, value, type);
    }
    else {
        this._args[index].value = value;
    }
};

module.exports = CLKernel;