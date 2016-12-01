/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# CLProgram class

Represents an OpenCL program.

**base:** [CLWrapper](clWrapper.html)

**Properties:**
- [numDevices](#numdevices)
- [devices](#devices)
- [sourceCode](#sourcecode)

**Methods:**
- [constructor](#constructor)
- [build](#build)
- [createKernel](#createkernel)
- [createAllKernels](#createallkernels)
- [getBuildStatus](#getbuildstatus)
- [getBuildOptions](#getbuildoptions)
- [getBuildLog](#getbuildlog)
- [getBuildLogs](#getbuildlogs)
- [getBinaries](#getbinaries)
*/

"use strict";
var CLWrapper = require("./clWrapper");
var util = require("util");
var _ = require("lodash");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var CLContext = require("./clContext");
var Bluebird = require("bluebird");
var clUtils = require("./clUtils");
var CLKernel = require("./clKernel");
var clPredefs = require("./clPredef");

const BUILD_ERROR_CODE = -11;

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseProgram(handle);
    });
}

/* ### constructor 1
Program can be created from source.

**arguments:**
- **context:** Owner CLContext instance.
- **source:** OpenCL program source code string.
*/
function CLProgram1(context, source) {
    this.context = context;
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var lengths = new (cl.types.SizeTArray)(1);
    lengths.set(0, source.length);
    var sources = new (cl.types.StringArray)(1);
    sources.set(0, source);
    var handle = cl.imports.clCreateProgramWithSource(clUtils.toHandle(context), 1, sources, lengths, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
}

/* ### constructor 2
Program can be created from binaries.

**arguments:**
- **context:** Owner CLContext instance.
- **binaries:** array of Buffers or a single Buffer containing the precompiled program binaries
- **devices:** corresponding CLDevice instances or handles for the above binaries
*/
function CLProgram2(context, binaries, devices) {
    this.context = context;
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);

    if (!_.isArray(binaries)) {
        binaries = [binaries];
    }
    var binaryArray = new (cl.types.Binaries)(binaries.length);
    var binarySizes = new (cl.types.SizeTArray)(binaries.length);
    for (var i = 0; i < binaries.length; i++) {
        binaryArray.set(i, binaries[i]);
        binarySizes.set(i, binaries[i].length);
    }
    var deviceArray = clUtils.createDeviceArray(devices);

    var handle = cl.imports.clCreateProgramWithBinary(
        clUtils.toHandle(context),
        deviceArray.length,
        deviceArray,
        binarySizes,
        binaryArray,
        null,
        err);

    cl.checkError(err);
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
}

/*
## constructor

### [version 1](#constructor-1)
Program can be created from source.

### [version 2](#constructor-2)
Program can be created from binaries.
*/
function CLProgram() {
    if (!(arguments[0] instanceof CLContext)) {
        throw new TypeError("First argument must be a CLContext instance.");
    }
    if (_.isString(arguments[1])) {
        CLProgram1.apply(this, arguments);
    }
    else {
        CLProgram2.apply(this, arguments);
    }
}

util.inherits(CLProgram, CLWrapper);

Object.defineProperties(CLProgram.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetProgramInfo";
        }
    },
    // ## numDevices
    // Number of devices
    numDevices: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("uint", this.cl.defs.CL_PROGRAM_NUM_DEVICES);
        }
    },
    // ## numDevices
    // Array of devices as [CLDevice](clDevice.html) instances.
    devices: {
        get: function () {
            this._throwIfReleased();
            var cl = this.cl;
            var CLDevice = require("./clDevice");
            return this._getArrayInfo(cl.types.DeviceId, cl.defs.CL_PROGRAM_DEVICES).map(
                function (did) {
                    return new CLDevice(cl, did);
                }
            );
        }
    },
    // ## sourceCode
    // Source code string if program was created from source, null otherwise.
    sourceCode: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PROGRAM_SOURCE);
        }
    }
});

/* ## build
Compiles a program source, or builds program from binaries.

**arguments**:
- **options:**: command line options, see [the platform API documentation](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/clBuildProgram.html)
- **devices:**: array of CLDevice instances or handles or null.
If it is a non-null value, the program executable is built for devices specified in this list for which a source or binary has been loaded,
if it"s null the program executable is built for all devices associated with program for which a source or binary has been loaded.

**returns:**

A promise that resolves to no value.
*/
CLProgram.prototype.build = function (options, devices) {
    this._throwIfReleased();
    var self = this;
    var cl = self.cl;
    options = options || null;
    var cbi, cb;
    var promise = new Bluebird(function (resolve, reject) {
        var done = false;
        try {
            cbi = function () {
                if (!done) {
                    try {
                        resolve();
                    }
                    finally {
                        done = true;
                    }
                }
            };
            cb = cl.types.BuildProgramNotify.toPointer(cbi);
            var err = cl.imports.clBuildProgram(
                self.handle,
                devices ? devices.length : 0,
                devices ? clUtils.createDeviceArray(devices) : null,
                options,
                cb,
                null);
            cl.checkError(err);
        }
        catch (e) {
            if (!done) {
                try {
                    if (e.code = BUILD_ERROR_CODE) {
                        return resolve();
                    }
                    reject(e);
                }
                finally {
                    done = true;
                }
            }
        }
    });
    promise._cb = cb;
    promise._cbi = cbi;
    return clUtils.keepAlive(promise);
};

CLProgram.prototype.createKernel = function (name) {
    return new CLKernel(this, name);
};

CLProgram.prototype.createAllKernels = function () {
    var numKernels = clPredefs.num;
    var err = this.cl.imports.clCreateKernelsInProgram(this.handle, 0, null, numKernels);
    this.cl.checkError(err);
    var nk = numKernels.deref();
    var kernels = new (this.cl.types.KernelArray)(nk);
    err = this.cl.imports.clCreateKernelsInProgram(this.handle, nk, kernels, null);
    this.cl.checkError(err);

    var result = [];
    for (var i = 0; i < nk; i++) {
        result.push(new CLKernel(this, kernels.get(i)));
    }
    return result;
};

CLProgram.prototype.getBuildStatus = function (device) {
    this._throwIfReleased();
    return this._getInfo2(ref.types.int, this.cl.imports.clGetProgramBuildInfo, device, this.cl.defs.CL_PROGRAM_BUILD_STATUS, true);
};

CLProgram.prototype.getBuildOptions = function (device) {
    this._throwIfReleased();
    return this._getStringInfo2(this.cl.imports.clGetProgramBuildInfo, device, this.cl.defs.CL_PROGRAM_BUILD_OPTIONS, true);
};

CLProgram.prototype.getBuildLog = function (device) {
    this._throwIfReleased();
    return this._getStringInfo2(this.cl.imports.clGetProgramBuildInfo, device, this.cl.defs.CL_PROGRAM_BUILD_LOG, true);
};

CLProgram.prototype.getBuildLogs = function () {
    this._throwIfReleased();
    var self = this;
    return this.context.devices.map(function (device) {
        return self.getBuildLog(device);
    }).join("\n");
};

CLProgram.prototype.getBinaries = function () {
    this._throwIfReleased();
    var cl = this.cl;
    var sizes = this._getBinarySizes();
    var binaries = new (cl.types.Binaries)(sizes.length);
    var result = [];
    for (var i = 0; i < sizes.length; i++) {
        var bin = new (cl.types.Binary)(sizes.get(i));
        binaries.set(i, bin.buffer);
        result.push(bin.buffer);
    }

    var err = cl.imports.clGetProgramInfo(this.handle, cl.defs.CL_PROGRAM_BINARIES, binaries.length * ref.sizeof.pointer, binaries.buffer, null);

    this.cl.checkError(err);

    return result;
};

CLProgram.prototype._getBinarySizes = function () {
    this._throwIfReleased();
    var numDevices = this.numDevices;
    var buffer = new (this.cl.types.SizeTArray)(numDevices);

    // get actual data
    var err = this.cl.imports.clGetProgramInfo(this.handle, this.cl.defs.CL_PROGRAM_BINARY_SIZES, numDevices * ref.sizeof.size_t, buffer.buffer, null);

    // error checking
    this.cl.checkError(err);

    return buffer;
};

module.exports = CLProgram;
