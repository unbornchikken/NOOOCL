var weak = require('weak');
var util = require('util');

function CLWrapper(cl, handle) {
    this.cl = cl;
    this.handle = handle;
    this.released = false;
    var releaseMethod = this.createReleaseMethod();
    if (releaseMethod) weak(this, releaseMethod);
}

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
}

module.exports = CLWrapper;
