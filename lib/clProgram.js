var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var CLContext = require('./clContext');
var Promise = require('bluebird');

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
    this.context = context;
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var lengths = new (cl.types.SizeTArray)(1);
    lengths[0] = source.length;
    var sources = new (cl.types.StringArray)(1);
    sources[0] = source;
    var handle = cl.imports.clCreateProgramWithSource(context.handle, 1, sources, lengths, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle);
}

function CLProgram2(context, binaries, devices) {
    this.context = context;
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);

    if (!_.isArray(binaries)) binaries = [binaries];
    var binaryArray = new (cl.types.Binaries)(binaries.length);
    var binarySizes = new (cl.types.SizeTArray)(binaries.length);
    for (var i = 0; i < binaries.length; i++) {
        binaryArray[i] = binaries[i];
        binarySizes[i] = binaries.length;
    }

    var handle = cl.imports.clCreateProgramWithBinary(
        context.handle,
        devices.length,
        cl.types.utils.createDeviceArray(devices),
        binarySizes,
        binaryArray,
        null,
        err);

    cl.checkError(err);
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLProgram, CLWrapper);

Object.defineProperties(CLProgram.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetProgramInfo';
        }
    },
    numDevices: {
        get: function () {
            return this._getInfo('uint', this.cl.defs.PROGRAM_NUM_DEVICES);
        }
    },
    devices: {
        get: function () {
            return this._getArrayInfo(this.cl.types.DeviceId, this.cl.defs.PROGRAM_DEVICES);
        }
    },
    sourceCode: {
        get: function() {
            return this._getStringInfo(this.cl.defs.PROGRAM_SOURCE);
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

CLProgram.prototype.build = function(options, devices) {
    var self = this;
    var cl = self.cl;
    if (_.isUndefined(options)) options = null;
    return new Promise(function(resolve, reject) {
        try {
            var err = cl.imports.clBuildProgram(
                self.handle,
                devices ? devices.length : 0,
                devices ? cl.types.utils.createDeviceArray(devices) : null,
                options,
                cl.types.BuildProgramNotify.toPointer(function() {
                    resolve();
                }),
                null);
            cl.checkError(err);
        }
        catch(e) {
            reject(e);
        }
    });
};

CLProgram.prototype.getBuildStatus = function(device) {
    return this._getInfo2(ref.types.int, this.cl.imports.clGetProgramBuildInfo, device, this.cl.defs.PROGRAM_BUILD_STATUS, true);
};

CLProgram.prototype.getBuildOptions = function(device) {
    return this._getStringInfo2(this.cl.imports.clGetProgramBuildInfo, device, this.cl.defs.PROGRAM_BUILD_OPTIONS, true);
};

CLProgram.prototype.getBuildLog = function(device) {
    return this._getStringInfo2(this.cl.imports.clGetProgramBuildInfo, device, this.cl.defs.PROGRAM_BUILD_LOG, true);
};

CLProgram.prototype.getBuildLogs = function() {
    var self = this;
    return this.context.devices.map(function(device) { return self.getBuildLog(device); }).join('\n');
};

module.exports = CLProgram;
