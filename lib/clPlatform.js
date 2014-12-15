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
        value: 'getPlatformInfo'
    },
    name: {
        get: function () {
            return this._getStringInfo(this.cl.defs.PLATFORM_NAME);
        }
    },
    vendor: {
        get: function () {
            return this._getStringInfo(this.cl.defs.PLATFORM_VENDOR);
        }
    },
    clVersion: {
        get: function () {
            return this._getStringInfo(this.cl.defs.PLATFORM_VERSION);
        }
    },
    profile: {
        get: function () {
            return this._getStringInfo(this.cl.defs.PLATFORM_PROFILE);
        }
    },
    extensions: {
        get: function () {
            return this._getStringInfo(this.cl.defs.PLATFORM_EXTENSIONS);
        }
    }
});

CLPlatform.prototype.createReleaseMethod = function () {
    return null;
};

CLPlatform.prototype.getDevices = function (deviceType) {
    var devices = [];
    var num = ref.alloc('uint');
    var err = this.cl.getDeviceIDs(this.handle, deviceType, 0, null, num);
    if (err === this.cl.defs.DEVICE_NOT_FOUND) return devices;
    this.cl.checkError(err);

    var n = num.deref();
    if (!n) return devices;

    var deviceIDs = new (this.cl.types.DeviceIdArray)(n);
    err = this.cl.getDeviceIDs(this.handle, deviceType, n, deviceIDs, null);
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
    return this.getDevices(this.cl.defs.DEVICE_TYPE_ALL);
};

CLPlatform.prototype.cpuDevices = function () {
    return this.getDevices(this.cl.defs.DEVICE_TYPE_CPU);
};

CLPlatform.prototype.gpuDevices = function () {
    return this.getDevices(this.cl.defs.DEVICE_TYPE_GPU);
};

CLPlatform.prototype.accelDevices = function () {
    return this.getDevices(this.cl.defs.DEVICE_TYPE_ACCELERATOR);
};

module.exports = CLPlatform;
