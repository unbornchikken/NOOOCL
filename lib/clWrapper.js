var weak = require('weak');
var _ = require('lodash');
var ref = require('ref');
var ArrayType = require('ref-array');

function CLWrapper(cl, handle) {
    this.cl = cl;
    this.handle = handle;
    this.released = false;
    this._cache = {};
    this._infoFunction = this.cl.imports[this._classInfoFunction];
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) weak(this, releaseMethod);
}

Object.defineProperties(CLWrapper.prototype, {
    _classInfoFunction: {
        get: function () {
            this._ni('get _classInfoFunction');
        }
    },
    version: {
        get: function () {
            return this.cl.version;
        }
    }
});

CLWrapper.prototype._ni = function (method) {
    throw new Error('Not implemented: ' + method);
};

CLWrapper.prototype._throwIfReleased = function (method) {
    if (this.released) throw new Error('CL object already released.');
};

CLWrapper.prototype._cached = function(key, f, noCache) {
    if (!noCache) {
        var value = this._cache[key];
        if (!_.isUndefined(value)) return value;
    }
    
    var result = f();

    if (!noCache) this._cache[key] = result;

    return result;
}

CLWrapper.prototype.createReleaseMethod = function () {
    this._ni('createReleaseMethod');
};

CLWrapper.prototype.release = function () {
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) releaseMethod();
    this.released = true;
};

CLWrapper.prototype._getInfo = function (elemType, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName, 
        function() {
            elemType = ref.coerceType(elemType);

            var info = ref.alloc(elemType);
            var err = self._infoFunction(self.handle, infoName, elemType.size, info, null);
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
        function() {
            elemType = ref.coerceType(elemType);

            var info = ref.alloc(elemType);
            var err = altFunction(self.handle, device.handle || device, infoName, elemType.size, info, null);
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
        function() {
            elemType = ref.coerceType(elemType);

            var needed = ref.alloc('size_t');

            var err = self._infoFunction(self.handle, infoName, 0, null, needed);
            self.cl.checkError(err);

            var nNeeded = needed.deref();

            if (nNeeded === 0) {
                // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
                return null;
            }

            var elemSize = elemType.size || ref.sizeof.pointer;
            var bufferSize = nNeeded / elemSize;
            var ElemTypeArray = ArrayType(elemType);
            var buffer = new ElemTypeArray(bufferSize);
            var err = self._infoFunction(self.handle, infoName, nNeeded, buffer.buffer, null);
            self.cl.checkError(err);

            var result = [];
            for (var i = 0; i < bufferSize; i++) {
                result.push(buffer[i]);
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
        function() {
            var arr = self._getArrayInfo('char', infoName, true);
            var str = arr.filter(function(code) { return code > 0; }).map(function (code) { return String.fromCharCode(code); }).join('').trim();
            return str;
        },
        noCache
    );
};

CLWrapper.prototype._getArrayInfo2 = function (elemType, altFunction, device, infoName, noCache) {
    var self = this;
    return this._cached(
        infoName,
        function() {
            var handle = device.handle || device;
            elemType = ref.coerceType(elemType);

            var needed = ref.alloc('size_t');

            var err = altFunction(self.handle, handle, infoName, 0, null, needed);
            self.cl.checkError(err);

            var nNeeded = needed.deref();

            if (nNeeded === 0) {
                // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
                return null;
            }

            var elemSize = elemType.size;
            var bufferSize = nNeeded / elemSize;
            var ElemTypeArray = ArrayType(elemType);
            var buffer = new ElemTypeArray(bufferSize);
            var err = altFunction(self.handle, handle, infoName, nNeeded, buffer.buffer, null);
            self.cl.checkError(err);

            var result = [];
            for (var i = 0; i < bufferSize; i++) {
                result.push(buffer[i]);
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
        function() {
            var arr = self._getArrayInfo2('char', altFunction, device, infoName, true);
            var str = arr.filter(function(code) { return code > 0; }).map(function (code) { return String.fromCharCode(code); }).join('').trim();
            return str;
        },
        noCache
    );
};

module.exports = CLWrapper;
