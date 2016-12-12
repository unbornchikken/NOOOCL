/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# CLContext class

Represents an OpenCL context.

**base:** [CLWrapper](clWrapper.html)

**Properties:**
- [numDevices](#numdevices)
- [devices](#devices)
- [contextProperties](#contextproperties)

**Methods:**
- [constructor](#constructor)
- [createProgram](#createprogram)
- [getSupportedImageFormats](#getsupportedimageformats)
*/

"use strict";
var CLWrapper = require("./clWrapper");
var util = require("util");
var _ = require("lodash");
var CLPlatform = require("./clPlatform");
var CLDevice = require("./clDevice");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var clUtils = require("./clUtils");
var clPredef = require("./clPredef");

var CLProgram = null;

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseContext(handle);
    });
}

/* #### constructor 1
Context can be created from devices.

**arguments:**
- **devices:** a single [CLDevice](clDevice.html) instance or handle,
    or an array of [CLDevice](clDevice.html) instances or handles
*/
function CLContext1(devices) {
    var i;
    var isArray = _.isArray(devices);
    var deviceCount = isArray ? devices.length : 1;
    var firstDevice = isArray ? devices[0] : devices;
    if (!(firstDevice instanceof CLDevice)) {
        throw new TypeError("Arguments unknown.");
    }
    var cl = firstDevice.cl;
    var deviceArray = new (cl.types.DeviceIdArray)(deviceCount);
    if (isArray) {
        for (i = 0; i < deviceCount; i++) {
            deviceArray.set(i, clUtils.toHandle(devices[i]));
        }
    }
    else {
        deviceArray.set(0, clUtils.toHandle(devices));
    }

    var err = clPredef.err;
    var handle = cl.imports.clCreateContext(null, deviceCount, deviceArray, null, null, err);

    cl.checkError(err);

    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
}

/* #### constructor 2

Context can be created for a platform.

**arguments:**
- **platform:** a [CLPlatform](clPlatform.html) instance or a handle
- **deviceType:** CL_DEVICE_TYPE_CPU, CL_DEVICE_TYPE_GPU, etc.
- **properties:** [clCreateContextFromType](https://www.khronos.org/registry/cl/sdk/1.2/docs/man/xhtml/clCreateContextFromType.html)
API properties and values in an array, except CL_CONTEXT_PLATFORM, which is passed automatically.
*/
function CLContext2(platform, deviceType, properties) {
    var cl = platform.cl;

    deviceType = deviceType || cl.defs.CL_DEVICE_TYPE_ALL;

    var propArray = clUtils.createPropArray(cl, properties, platform);

    var err = clPredef.err;
    var handle = cl.imports.clCreateContextFromType(propArray, deviceType, null, null, err);

    cl.checkError(err);

    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
}

/*
## constructor

### [version 1](#constructor-1)
Context can be created from devices.

### [version 2](#constructor-2)
Context can be created for a platform.
*/
function CLContext(arg) {
    if (arg instanceof CLPlatform) {
        CLContext2.apply(this, arguments);
    }
    else {
        CLContext1.apply(this, arguments);
    }
}

util.inherits(CLContext, CLWrapper);

Object.defineProperties(CLContext.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetContextInfo";
        }
    },
    // ## numDevices
    // Number of supported devices
    numDevices: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("uint", this.cl.defs.CL_CONTEXT_NUM_DEVICES);
        }
    },
    // ## numDevices
    // Array of supported devices as [CLDevice](clDevice.html) instances.
    devices: {
        get: function () {
            this._throwIfReleased();
            var cl = this.cl;
            return this._getArrayInfo(cl.types.DeviceId, cl.defs.CL_CONTEXT_DEVICES)
                .map(function (did) {
                    return new CLDevice(cl, did);
                });
        }
    },
    // ## contextProperties
    // Returns the properties and values of the context.
    contextProperties: {
        get: function () {
            this._throwIfReleased();
            return this._getArrayInfo("size_t", this.cl.defs.CL_CONTEXT_PROPERTIES);
        }
    }
});

/* ## createProgram

Creates an OpenCL program ...

### version 1

... from source

**arguments:**
- **source:** OpenCL program source code string.

### version 2

... from binaries

**arguments:**
- **binaries:** array of Buffers or a single Buffer containing the precompiled program binaries
- **devices:** corresponding CLDevice instances or handles for the above binaries

**returns**:
[CLProgram](clProgram.html) instance
*/
CLContext.prototype.createProgram = function (arg1, arg2) {
    this._throwIfReleased();
    CLProgram = CLProgram || (CLProgram = require("./clProgram"));
    return new CLProgram(this, arg1, arg2);
};

/* ## getSupportedImageFormats

**arguments:**
- **flags:** [cl_mem_flags](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/enums.html#cl_mem_flags)
- **type:** [cl_mem_object_type](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/enums.html#cl_mem_object_type)

**returns**:

the supported image formats represented in an array of the following objects:

    {
        imageChannelOrder: ...,
        imageChannelDataType: ...
    }
*/
CLContext.prototype.getSupportedImageFormats = function (flags, type) {
    this._throwIfReleased();
    var i;
    var numFormats = ref.alloc("uint");
    var err = this.cl.imports.clGetSupportedImageFormats(this.handle, flags, type, 0, null, numFormats);

    this.cl.checkError(err);

    var num = numFormats.deref();
    var resultArray = new (this.cl.types.ImageFormatArray)(num);

    err = this.cl.imports.clGetSupportedImageFormats(this.handle, flags, type, num, resultArray, null);

    this.cl.checkError(err);

    var result = [];
    var item;
    for (i = 0; i < num; i++) {
        item = resultArray.get(i);
        result.push({
            imageChannelOrder: item.imageChannelOrder,
            imageChannelDataType: item.imageChannelDataType
        });
    }
    return result;
};

module.exports = CLContext;