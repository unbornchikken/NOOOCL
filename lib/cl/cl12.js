var util = require('util');
var CL11 = require('./cl11');

function CL12() {
    CL11.call(this);
    this.version = 1.2;
    this.imports.clReleaseDevice = function() {}
}

util.inherits(CL12, CL11);

module.exports = CL12;