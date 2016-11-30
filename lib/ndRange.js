"use strict";

var _ = require("lodash");
var types = require("./types");

function NDRange(xSize, ySize, zSize) {
    if (_.isNumber(xSize)) {
        ySize = _.isNumber(ySize) ? ySize : 0;
        zSize = _.isNumber(zSize) ? zSize : 0;

        this.sizes = new (types.SizeTArray)(3);
        this.sizes.set(0, xSize);
        this.sizes.set(1, ySize);
        this.sizes.set(2, zSize);
    }
    else {
        this.sizes = null;
    }
}

Object.defineProperties(NDRange.prototype, {
    dimensions: {
        get: function () {
            return this.sizes.get(2) !== 0 ? 3 : (this.sizes.get(1) !== 0 ? 2 : (this.sizes.get(0) !== 0 ? 1 : 0));
        }
    },
    xSize: {
        get: function() {
            return this.sizes.get(0);
        }
    },
    ySize: {
        get: function() {
            return this.sizes.get(1);
        }
    },
    zSize: {
        get: function() {
            return this.sizes.get(2);
        }
    }
});

NDRange.nullRange = new NDRange();

module.exports = NDRange;