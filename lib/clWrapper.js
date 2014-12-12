var weak = require('weak');
var bridjs = require('bridjs');
var nodecl = require('nodecl');
var Signature = bridjs.Signature;
var _ = require('lodash');

function CLWrapper(cl, handle) {
    this.cl = cl;
    this.handle = handle;
    this.released = false;
    this._cache = {};
    this._infoFunction = this.cl[this._classInfoFunction];
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

CLWrapper.prototype.createReleaseMethod = function () {
    this._ni('createReleaseMethod');
};

CLWrapper.prototype.release = function () {
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) releaseMethod();
    this.released = true;
};

CLWrapper.prototype._getInfo = function (elemType, infoName, noCache) {
    if (!noCache) {
        var value = this._cache[infoName];
        if (!_.isUndefined(value)) return value;
    }

    var info = bridjs.newNativeValue(elemType);
    var err = this._infoFunction(this.handle, infoName, bridjs.sizeof(elemType), bridjs.byPointer(info), null);
    nodecl.checkError(err);
    var result = info.get();

    if (!noCache) this._cache[infoName] = result;

    return result;
};

CLWrapper.prototype._getArrayInfo = function (elemType, infoName, noCache) {
    if (!noCache) {
        var value = this._cache[infoName];
        if (!_.isUndefined(value)) return value;
    }

    var needed = new bridjs.NativeValue.size();

    var err = this._infoFunction(this.handle, infoName, 0, null, bridjs.byPointer(needed));
    nodecl.checkError(err);

    var nNeeded = needed.get();

    if (nNeeded === 0) {
        // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
        return null;
    }

    var elemSize = bridjs.sizeof(elemType);
    var bufferSize = nNeeded / elemSize;
    var buffer = bridjs.newArray(elemType, bufferSize);
    var err = this._infoFunction(this.handle, infoName, nNeeded, bridjs.byPointer(buffer), null);
    nodecl.checkError(err);

    var result = [];
    for (var i = 0; i < bufferSize; i++) {
        result.push(buffer.get(i));
    }

    if (!noCache) this._cache[infoName] = result;

    return result;
};

CLWrapper.prototype._getStringInfo = function (infoName, noCache) {
    if (!noCache) {
        var value = this._cache[infoName];
        if (!_.isUndefined(value)) return value;
    }

    var arr = this._getArrayInfo(Signature.char, infoName, true);
    var str = arr.join('').trim();

    if (!noCache) this._cache[infoName] = str;

    return str;
};

module.exports = CLWrapper;
