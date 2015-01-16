var _ = require('lodash');
var ref = require('ref');
var assert = require('assert');
var types = require('./cl/types');

function NDRange(xSize, ySize, zSize) {
    xSize = _.isNumber(xSize) ? xSize : 0;
    ySize = _.isNumber(ySize) ? ySize : 0;
    zSize = _.isNumber(zSize) ? zSize : 0;

    this.sizes = new (types.SizeTArray)(3);
    this.sizes[0] = xSize;
    this.sizes[1] = ySize;
    this.sizes[2] = zSize;
}

Object.defineProperties(NDRange.prototype, {
    dimensions: {
        get: function () {
            return this.sizes[2] != 0 ? 3 : (this.sizes[1] != 0 ? 2 : (this.sizes[0] != 0 ? 1 : 0));
        }
    }
});

NDRange.NullRange = new NDRange();

module.exports = NDRange;