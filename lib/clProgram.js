var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var CLContext = require('./clContext');

function CLProgram() {
    if (!(arguments[0] instanceof CLContext)) throw new TypeError('First argument must be a CLContext instance.');
    if (_.isString(arguments[1])) {
        CLProgram1.apply(this, arguments);
    }
    else {
        CLProgram2.apply(this, arguments);
    }
}

function CLProgram1(context, source) {
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var lengths = new (cl.types.SizeTArray)(1);
    lengths[0] = source.length;
    var sources = new (cl.types.StringArray)(1);
    sources[0] = source;
    var handle = cl.clCreateProgramWithSource(context.handle, 1, sources, lengths, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle);
}

function CLProgram2(context, binaries, devices) {
    if (!_.isArray(binaries)) binaries = [binaries];
    if (!_.isArray(devices)) devices = [devices];
}

util.inherits(CLProgram, CLWrapper);

Object.defineProperties(CLProgram.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetProgramInfo';
        }
    }
});

CLProgram.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseProgram(handle);
    };
};
