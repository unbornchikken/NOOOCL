var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var NDRange = require('./ndRange');

function CLKernel(program, name) {
    var cl = program.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateKernel(program.handle, name, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle);
    this.propgram = program;
    this.name = name;
}

util.inherits(CLKernel, CLWrapper);

Object.defineProperties(CLKernel.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetKernelInfo';
        }
    },
    context: {
        get: function() {
            return this.program.context;
        }
    },
    numArgs: {
        get: function() {
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
    return this._getInfo2('size_t', this.cl.imports.clGetKernelWorkGroupInfo, device.handle, this.cl.defs.KERNEL_WORK_GROUP_SIZE);
};

CLKernel.prototype.getCompileWorkGroupSize = function(device) {

};

module.exports = CLKernel;