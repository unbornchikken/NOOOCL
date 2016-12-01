/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# CLPlatform class

Represents an OpenCL platform.

**base:** [CLWrapper](clWrapper.html)

**Properties:**
- [name](#name)
- [vendor](#vendor)
- [clVersion](#clversion)
- [profile](#profile)
- [extensions](#extensions)

**Methods:**
- [constructor](#constructor)
- [getDevices](#getdevices)
- [allDevices](#alldevices)
- [cpuDevices](#cpudevices)
- [accelDevices](#acceldevices)
*/

"use strict";

var CLWrapper = require("./clWrapper");
var util = require("util");
var CLDevice = require("./clDevice");
var clPredef = require("./clPredef");

/* ## constructor

**arguments:**
- **cl:**: object of type [CL11](cl11.html)
- **handle:**: OpenCL handle
 */
function CLPlatform(cl, handle) {
    CLWrapper.call(this, cl, handle, null);
}

util.inherits(CLPlatform, CLWrapper);

Object.defineProperties(CLPlatform.prototype, {
    _classInfoFunction: {
        value: "clGetPlatformInfo"
    },
    // ## name
    // The name of the platform.
    name: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_NAME);
        }
    },
    // ## vendor
    // Platform"s vendor.
    vendor: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_VENDOR);
        }
    },
    // ## clVersion
    // Platform"s version.
    clVersion: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_VERSION);
        }
    },
    // ## profile
    // Platform"s profile..
    profile: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_PROFILE);
        }
    },
    // ## extensions
    // Available extensions.
    extensions: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_EXTENSIONS);
        }
    }
});

/* ## getDevices

**arguments:**
- **deviceType**: combination of the CL_DEVICE_TYPE_* flags

** result: **

Array of [CLDevice](clDevice.html) instances.
*/
CLPlatform.prototype.getDevices = function (deviceType) {
    this._throwIfReleased();
    var i, device, devNumVersion;
    var devices = [];
    var num = clPredef.num;
    // _OpenCL API_: [clGetDeviceIDs](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/clGetDeviceIDs.html)
    var err = this.cl.imports.clGetDeviceIDs(this.handle, deviceType, 0, null, num);
    if (err === this.cl.defs.CL_DEVICE_NOT_FOUND) {
        return devices;
    }
    this.cl.checkError(err);

    var n = num.deref();
    if (!n) {
        return devices;
    }

    var deviceIDs = new (this.cl.types.DeviceIdArray)(n);
    // _OpenCL API_: [clGetDeviceIDs](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/clGetDeviceIDs.html)
    err = this.cl.imports.clGetDeviceIDs(this.handle, deviceType, n, deviceIDs, null);
    this.cl.checkError(err);

    for (i = 0; i < n; i++) {
        device = new CLDevice(this.cl, deviceIDs.get(i), this);
        devNumVersion = device.numVersion;
        if (devNumVersion >= this.cl.version) {
            devices.push(device);
        }
    }
    return devices;
};

/* ## allDevices

**returns:**

Array of all available devices ([CLDevice](clDevice.html) instances).
 */
CLPlatform.prototype.allDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_ALL);
};

/* ## cpuDevices

**returns:**

Array of CPU devices ([CLDevice](clDevice.html) instances).
 */
CLPlatform.prototype.cpuDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_CPU);
};

/* ## gpuDevices

**returns:**

Array of GPU devices ([CLDevice](clDevice.html) instances).
 */
CLPlatform.prototype.gpuDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_GPU);
};

/* ## accelDevices

**returns:**

Array of accelerator devices ([CLDevice](clDevice.html) instances).
 */
CLPlatform.prototype.accelDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_ACCELERATOR);
};

module.exports = CLPlatform;
