var weak = require('weak');
var bridjs = require('bridjs');
var nodecl = require('nodecl');
var Signature = bridjs.Signature;
var _ = require('lodash');

function CLWrapper(cl, handle) {
    this.cl = cl;
    this.handle = handle;
    this.released = false;
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) weak(this, releaseMethod);
}

Object.defineProperties(CLWrapper.prototype, {
    _classInfoFunction: {
        get: function() {
            this._ni('get _classInfoFunction');
        }
    },
    version: {
        get: function() {
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

CLWrapper.prototype.createReleaseMethod = function() {
    this._ni('createReleaseMethod');
};

CLWrapper.prototype.release = function() {
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) releaseMethod();
    this.released = true;
};

CLWrapper.prototype._getArrayInfo = function(elemType, infoName) {
    var needed = new bridjs.NativeValue.size();
    var infoFunction = this.cl[this._classInfoFunction];
    var err = infoFunction(this.handle, infoName, 0, null, bridjs.byPointer(needed));
    nodecl.checkError(err);

    var nNeeded = needed.get();

    if (nNeeded === 0) {
        // e.g. CL_CONTEXT_PROPERTIES can return needed = 0
        return null;
    }

    var elemSize = bridjs.sizeof(elemType);
    var buffer = bridjs.newArray(elemType, nNeeded / elemSize);
    var err = infoFunction(this.handle, infoName, nNeeded, bridjs.byPointer(buffer), null);
    nodecl.checkError(err);

    var result = [];
    for (var i = 0; i < nNeeded; i++) {
        result.push(buffer.get(i));
    }
    return result;
};

CLWrapper.prototype._getStringInfo = function(infoName) {
    var arr = this._getArrayInfo(Signature.char, infoName);
    var str = '';
    _.forEach(arr, function(chr) {
        str += chr;
    });
    return str;
};

module.exports = CLWrapper;
