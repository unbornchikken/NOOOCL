'use strict';
const _ = require('lodash');
const assert = require('assert');
const CLWrapper = require('./CLWrapper');

let CLProgram = null;

class CLContext extends CLWrapper {
    constructor(options) {
        assert(_.isObject(options), 'Object argument expected.');

        if (options.device) {
            super(this._initByDevices([options.device]));
        }
        else if (_.isArray(options.devices)) {
            super(this._initByDevices(options.devices));
        }
        else if (options.platform) {
            super(this._initByPlatform(options.platform, options.deviceType, options.properties));
        }
        else {
            assert(false, 'Invalid options.');
        }
    }

    _initByDevices(devices) {
        return this.cl.createContext(null, devices, null, null);
    }

    _initByPlatform(platform, deviceType, properties) {
        let props = [ this.cl.CONTEXT_PLATFORM, this.getHandle(platform) ];
        if (_.isArray(properties)) {
            props = props.concat(properties);
        }
        return this.cl.createContextFromType(props, deviceType || this.cl.DEVICE_TYPE_ALL);
    }

    classInfoFunction() {
        return this.cl.getContextInfo;
    }

    get numDevices() {
        return this.getInfo(this.cl.CONTEXT_NUM_DEVICES);
    }

    get devices() {
        return this.getArrayInfo(this.cl.CONTEXT_DEVICES);
    }

    get contextProperties() {
        return this.getArrayInfo(this.cl.CONTEXT_PROPERTIES);
    }

    createReleaseMethod() {
        const handle = this.handle;
        const cl = this.cl;
        return () => cl.imports.clReleaseContext(handle);
    }

    createProgram(options) {
        this.throwIfReleased();

        if (!CLProgram) {
            CLProgram = require('./CLProgram');
        }

        return new CLProgram(options);
    }

    getSupportedImageFormats(flags, type) {
        this.throwIfReleased();

        return this.cl.getSupportedImageFormats(this.handle, flags, type);
    }
}

module.exports = CLContext;