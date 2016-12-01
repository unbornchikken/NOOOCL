/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# CLWrapper abstract class

Base class of OpenCL wrapper classes.

**base:** Object

**Properties:**
- [cl](#cl)
- [handle](#handle)
- [version](#version)

**Methods:**
- [constructor](#constructor)
- [createReleaseFunction](#createReleaseFunction)
- [release](#release)
*/

"use strict";
var _ = require("lodash");
var fastcall = require("fastcall");
var Disposable = fastcall.Disposable.Legacy;
var ref = fastcall.ref;
var ArrayType = fastcall.ArrayType;
var clUtils = require("./clUtils");
var CL11 = require("./cl11");
var assert = require("assert");
var util = require("util");

/* ## constructor

**arguments:**
- **cl:**: object of type [CL11](cl11.html)
- **handle:**: OpenCL handle
*/
function CLWrapper(cl, handle, releaseFunction) {
    assert(cl instanceof CL11, "Argument 'cl' is not a CL11 instance.");
    assert(ref.getType(handle) === ref.types.void, "Argument 'handle' is not a pointer.");
    assert(!ref.isNull(handle), "Handle is null.");

    Disposable.call(this, releaseFunction);

    // ## object of type [CL11](cl11.html)
    this.cl = cl;

    // ## the OpenCL object handle
    this.handle = handle;

    this._cache = {};
    this._infoFunction = this.cl.imports[this._classInfoFunction];
}

util.inherits(CLWrapper, Disposable);

Object.defineProperties(CLWrapper.prototype, {
    _classInfoFunction: {
        get: function () {
            this._ni("get _classInfoFunction");
        }
    },
    // ## version
    // Returns the current OpenCL platform"s version (see [CL11](cl11.html) version property)
    version: {
        get: function () {
            return this.cl.version;
        }
    }
});

CLWrapper._releaseFunction = function (func) {
    return func;
}

CLWrapper.prototype._ni = function (method) {
    throw new Error("Not implemented: " + method);
};

CLWrapper.prototype._throwIfReleased = function () {
    if (this._released) {
        throw new Error(this.constructor.name + " object already released.");
    }
};

CLWrapper.prototype._cached = function (key, f, noCache) {
    if (!noCache) {
        var value = this._cache[key];
        if (!_.isUndefined(value)) {
            return value;
        }
    }

    var result = f();

    if (!noCache) {
        this._cache[key] = result;
    }

    return result;
};

/* ## release

Releases the underlying OpenCL object.
*/
CLWrapper.prototype.release = function () {
    this.dispose();
};

CLWrapper.prototype._getInfo = function (elemType, infoName, noCache) {
    return this._getInfoWith(this._infoFunction, elemType, infoName, noCache);
};

CLWrapper.prototype._getInfoWith = function (infoFunction, elemType, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function () {
            elemType = ref.coerceType(elemType);

            var info = ref.alloc(elemType);
            var err = infoFunction(self.handle, infoName, elemType.size || ref.sizeof.pointer, info, null);
            self.cl.checkError(err);
            var result = info.deref();

            return result;
        },
        noCache
    );
};

CLWrapper.prototype._getInfo2 = function (elemType, altFunction, device, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function () {
            elemType = ref.coerceType(elemType);

            var info = ref.alloc(elemType);
            var err = altFunction(self.handle, clUtils.toHandle(device), infoName, elemType.size || ref.sizeof.pointer, info, null);
            self.cl.checkError(err);
            var result = info.deref();

            return result;
        },
        noCache
    );
};

CLWrapper.prototype._getArrayInfo = function (elemType, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function () {
            var i;
            elemType = ref.coerceType(elemType);

            var needed = ref.alloc("size_t");

            var err = self._infoFunction(self.handle, infoName, 0, null, needed);
            self.cl.checkError(err);

            var nNeeded = needed.deref();

            if (nNeeded === 0) {
                // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
                return null;
            }

            var elemSize = elemType.size || ref.sizeof.pointer;
            var bufferSize = nNeeded / elemSize;
            var ElemTypeArray = new ArrayType(elemType);
            var buffer = new ElemTypeArray(bufferSize);
            err = self._infoFunction(self.handle, infoName, nNeeded, buffer.buffer, null);
            self.cl.checkError(err);

            var result = [];
            for (i = 0; i < bufferSize; i++) {
                result.push(buffer.get(i));
            }

            return result;
        },
        noCache
    );
};

CLWrapper.prototype._getStringInfo = function (infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function () {
            var arr = self._getArrayInfo("char", infoName, true);
            var str = arr.filter(function (code) {
                return code > 0;
            }).map(function (code) {
                return String.fromCharCode(code);
            }).join("").trim();
            return str;
        },
        noCache
    );
};

CLWrapper.prototype._getArrayInfo2 = function (elemType, altFunction, device, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function () {
            var i;
            var handle = clUtils.toHandle(device);
            elemType = ref.coerceType(elemType);

            var needed = ref.alloc("size_t");

            var err = altFunction(self.handle, handle, infoName, 0, null, needed);
            self.cl.checkError(err);

            var nNeeded = needed.deref();

            if (nNeeded === 0) {
                // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
                return null;
            }

            var elemSize = elemType.size || ref.sizeof.pointer;
            var bufferSize = nNeeded / elemSize;
            var ElemTypeArray = new ArrayType(elemType);
            var buffer = new ElemTypeArray(bufferSize);
            err = altFunction(self.handle, handle, infoName, nNeeded, buffer.buffer, null);
            self.cl.checkError(err);

            var result = [];
            for (i = 0; i < bufferSize; i++) {
                result.push(buffer.get(i));
            }

            return result;
        },
        noCache
    );
};

CLWrapper.prototype._getStringInfo2 = function (altFunction, device, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function () {
            var arr = self._getArrayInfo2("char", altFunction, device, infoName, true);
            var str = arr.filter(function (code) {
                return code > 0;
            }).map(function (code) {
                return String.fromCharCode(code);
            }).join("").trim();
            return str;
        },
        noCache
    );
};

module.exports = CLWrapper;
