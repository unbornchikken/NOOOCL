var util = require('util');
var CL11 = require('CL11');

function CL12() {
    CL11.call(this);
    this.version = 1.2;
}

util.inherits(CL12, CL11);

module.exports = CL12;