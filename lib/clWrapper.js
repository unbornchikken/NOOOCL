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

CLWrapper.prototype.createReleaseMethod = function () {
    this._ni('createReleaseMethod');
};

CLWrapper.prototype.release = function () {
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) releaseMethod();
    this.released = true;
};

CLWrapper.prototype._getInfo = function (elemType, infoName, noCache) {
    elemType = ref.coerceType(elemType);

    if (!noCache) {
        var value = this._cache[infoName];
        if (!_.isUndefined(value)) return value;
    }

    var info = ref.alloc(elemType);
    var err = this._infoFunction(this.handle, infoName, elemType.size, info, null);
    this.cl.checkError(err);
    var result = info.deref();

    if (!noCache) this._cache[infoName] = result;

    return result;
};

CLWrapper.prototype._getArrayInfo = function (elemType, infoName, noCache) {
    elemType = ref.coerceType(elemType);

    if (!noCache) {
        var value = this._cache[infoName];
        if (!_.isUndefined(value)) return value;
    }

    var needed = ref.alloc('size_t');

    var err = this._infoFunction(this.handle, infoName, 0, null, needed);
    this.cl.checkError(err);

    var nNeeded = needed.deref();

    if (nNeeded === 0) {
        // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
        return null;
    }

    var elemSize = elemType.size;
    var bufferSize = nNeeded / elemSize;
    var ElemTypeArray = ArrayType(elemType);
    var buffer = new ElemTypeArray(bufferSize);
    var err = this._infoFunction(this.handle, infoName, nNeeded, buffer.buffer, null);
    this.cl.checkError(err);

    var result = [];
    for (var i = 0; i < bufferSize; i++) {
        result.push(buffer[i]);
    }

    if (!noCache) this._cache[infoName] = result;

    return result;
};

CLWrapper.prototype._getStringInfo = function (infoName, noCache) {
    if (!noCache) {
        var value = this._cache[infoName];
        if (!_.isUndefined(value)) return value;
    }

    var arr = this._getArrayInfo('char', infoName, true);
    var str = arr.map(function (code) { return String.fromCharCode(code); }).join('').trim();

    if (!noCache) this._cache[infoName] = str;

    return str;
};

module.exports = CLWrapper;
