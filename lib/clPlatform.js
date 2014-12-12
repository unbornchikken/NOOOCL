var CLWrapper = require('./clWrapper');
var util = require('util');
var bridjs = require('bridjs');
var nodecl = require('nodecl');
var Signature = bridjs.Signature;
var _ = require('lodash');
var CLDevice = require('./clDevice');

function CLPlatform(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLPlatform, CLWrapper);

Object.defineProperties(CLPlatform.prototype, {
    _classInfoFunction: {
        value: 'getPlatformInfo'
    },
    name: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_NAME);
        }
    },
    vendor: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_VENDOR);
        }
    },
    clVersion: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_VERSION);
        }
    },
    profile: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_PROFILE);
        }
    },
    extensions: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_EXTENSIONS);
        }
    }
});

CLPlatform.prototype.createReleaseMethod = function() { return null; };

CLPlatform.prototype.getDevices = function(deviceType) {
    var devices = [];
    var num = new bridjs.NativeValue.uint();
    var err = this.cl.getDeviceIDs(this.handle, deviceType, 0, null, bridjs.byPointer(num));
    if (err === this.cl.DEVICE_NOT_FOUND) return devices;
    nodecl.checkError(err);

    var n = num.get();
    if (!n) return devices;

    var deviceIDs = bridjs.newArray(nodecl.Type.deviceId, n);
    err = this.cl.getDeviceIDs(this.handle, deviceType, n, bridjs.byPointer(deviceIDs), null);
    nodecl.checkError(err);

    for (var i = 0; i < n; i++) {
        var device = new CLDevice(this.cl, deviceIDs.get(i), this);
        var devNumVersion = device.numVersion;
        if (devNumVersion >= this.cl.version) {
            devices.push(device);
        }
    }
    return devices;
};

CLPlatform.prototype.allDevices = function() {
    return this.getDevices(this.cl.DEVICE_TYPE_ALL);
};

CLPlatform.prototype.cpuDevices = function() {
    return this.getDevices(this.cl.DEVICE_TYPE_CPU);
};

CLPlatform.prototype.gpuDevices = function() {
    return this.getDevices(this.cl.DEVICE_TYPE_GPU);
};

CLPlatform.prototype.accelDevices = function() {
    return this.getDevices(this.cl.DEVICE_TYPE_ACCELERATOR);
};

module.exports = CLPlatform;
