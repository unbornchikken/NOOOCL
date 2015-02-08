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
- [createReleaseMethod](#createReleaseMethod)
- [getDevices](#getDevices)
- [allDevices](#allDevices)
- [cpuDevices](#cpuDevices)
- [accelDevices](#accelDevices)
*/

'use strict';
var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var CLDevice = require('./clDevice');
var ref = require('ref');

function CLPlatform(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLPlatform, CLWrapper);

Object.defineProperties(CLPlatform.prototype, {
    _classInfoFunction: {
        value: 'clGetPlatformInfo'
    },
    // ## name
    name: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_NAME);
        }
    },
    // ## vendor
    vendor: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_VENDOR);
        }
    },
    // ## clVersion
    clVersion: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_VERSION);
        }
    },
    // ## profile
    profile: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_PROFILE);
        }
    },
    // ## extensions
    extensions: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_PLATFORM_EXTENSIONS);
        }
    }
});

CLPlatform.prototype.createReleaseMethod = function () {
    return null;
};

CLPlatform.prototype.getDevices = function (deviceType) {
    this._throwIfReleased();
    var devices = [];
    var num = ref.alloc('uint');
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
    err = this.cl.imports.clGetDeviceIDs(this.handle, deviceType, n, deviceIDs, null);
    this.cl.checkError(err);

    for (var i = 0; i < n; i++) {
        var device = new CLDevice(this.cl, deviceIDs[i], this);
        var devNumVersion = device.numVersion;
        if (devNumVersion >= this.cl.version) {
            devices.push(device);
        }
    }
    return devices;
};

CLPlatform.prototype.allDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_ALL);
};

CLPlatform.prototype.cpuDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_CPU);
};

CLPlatform.prototype.gpuDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_GPU);
};

CLPlatform.prototype.accelDevices = function () {
    this._throwIfReleased();
    return this.getDevices(this.cl.defs.CL_DEVICE_TYPE_ACCELERATOR);
};

module.exports = CLPlatform;
