'use strict';
const CLWrapper = require('./CLWrapper');
const CLDevice = require('./CLDevice');
const helpers = require('./helpers');

module.exports = CLPlatform;

class CLPlatform extends CLWrapper {
    constructor(handle) {
        super(handle);
        this._versionNum = 0;
    }

    classInfoFunction() {
        return this.cl.getPlatformInfo;
    }

    get name() {
        return this.getStringInfo(this.cl.PLATFORM_NAME);
    }

    get vendor() {
        return this.getStringInfo(this.cl.PLATFORM_VENDOR);
    }

    get version() {
        return this.getStringInfo(this.cl.PLATFORM_VERSION);
    }

    get versionNum() {
        if (this._versionNum) {
            return this._versionNum;
        }
        this._versionNum = helpers.toVersionNum(this.version);
        return this._versionNum;
    }

    get profile() {
        return this.getStringInfo(this.cl.PLATFORM_PROFILE);
    }

    get extensions() {
        return this.getStringInfo(this.cl.PLATFORM_EXTENSIONS);
    }

    createReleaseMethod() {
        return null;
    }

    getDevices(type) {
        this.throwIfReleased();
        const devices = [];
        for (const id of this.cl.getDeviceIDs(this.handle, type || null)) {
            devices.push(new CLDevice(id, this));
        }
        return devices;
    }

    getCPUDevices() {
        return this.getDevices(this.cl.DEVICE_TYPE_CPU);
    }

    getGPUDevices() {
        return this.getDevices(this.cl.DEVICE_TYPE_GPU);
    }

    getAcceleratorDevices() {
        return this.getDevices(this.cl.DEVICE_TYPE_ACCELERATOR);
    }
}