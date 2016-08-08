'use strict';
const weak = require('weak');
const _ = require('lodash');
const assert = require('assert');
const cl = require('node-opencl');

class CLWrapper {
    constructor(handle) {
        assert(handle, 'Argument "handle" expected.');

        this.handle = handle;
        this.cl = cl;

        let relMark = {
            released: false
        };
        this._relMark = relMark;
        this._cache = new Map();
        const releaseMethod = this.createReleaseMethod();
        if (releaseMethod) {
            const releaseMethod2 = function() {
                if (!relMark.released) {
                    relMark.released = true;
                    relMark = null;
                    releaseMethod();
                }
            };
            weak(this, releaseMethod2);
        }
    }

    get classInfoFunction() {
        throwNotImplemented('classInfoFunction');
    }

    createReleaseMethod() {
        throwNotImplemented('createReleaseMethod');
    }

    release() {
        if (this._relMark.released) {
            return;
        }
        this._relMark.released = true;
        const releaseMethod = this.createReleaseMethod();
        if (releaseMethod) {
            releaseMethod();
        }
    }

    getInfo(infoName, noCache) {
        return this.getInfoWith(this.classInfoFunction(), infoName, noCache);
    }

    getArrayInfo(infoName, noCache) {
        const result = this.getInfo(infoName, noCache);
        assert(_.isArray(result));
        return result;
    }

    getStringInfo(infoName, noCache) {
        const result = this.getInfo(infoName, noCache);
        assert(_.isString(result));
        return result;
    }

    getInfoWith(infoFunction, infoName, noCache) {
        return this._getInfo(
            infoName,
            () => infoFunction(this.handle, infoName),
            noCache
        );
    }

    getInfo2(infoFunction, device, infoName, noCache) {
        return this._getInfo(
            infoName,
            () => infoFunction(this.handle, this.getHandle(device), infoName),
            noCache
        );
    }

    getArrayInfo2(infoFunction, device, infoName, noCache) {
        const result = this.getInfo2(infoFunction, device, infoName, noCache);
        assert(_.isArray(result));
        return result;
    }

    getStringInfo2(infoFunction, device, infoName, noCache) {
        const result = this.getInfo2(infoFunction, device, infoName, noCache);
        assert(_.isString(result));
        return result;
    }

    _getInfo(key, f, noCache) {
        this.throwIfReleased();

        if (!noCache) {
            const value = this._cache.get(key);
            if (!_.isUndefined(value)) {
                return value;
            }
        }

        const result = f();

        if (!noCache) {
            this._cache.set(key, result);
        }

        return result;
    }

    getHandle(obj) {
        if (obj instanceof CLWrapper) {
            return obj.handle;
        }
        return obj;
    }

    _throwNotImplemented(what) {
        throw new Error('Not implemented: ' + this.constructor.name + '.' + what);
    }

    throwIfReleased() {
        if (this._relMark.released) {
            throw new Error('Cannot access released ' + this.constructor.name + '.');
        }
    }
}

module.exports = CLWrapper;