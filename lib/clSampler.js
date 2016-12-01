"use strict";

var CLWrapper = require("./clWrapper");
var util = require("util");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var clUtils = require("./clUtils");

function createReleaseFunction(cl, handle) {
    return CLWrapper._releaseFunction(function () {
        cl.imports.clReleaseSampler(handle);
    });
}

/**
 *    creates a sampler object
 *
 *    Params:
 *        normalizedCoords= determines if the image coordinates specified are normalized
 *        addressingMode    = specifies how out-of-range image coordinates are handled when reading from an image
 *        filterMode        = specifies the type of filter that must be applied when reading an image
 */
function CLSampler(context, normalizedCoords, addressingMode, filterMode) {
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateSampler(clUtils.toHandle(context, "context"), normalizedCoords, addressingMode, filterMode, err);
    cl.checkError(err);
    CLWrapper.call(this, cl, handle, createReleaseFunction(cl, handle));
    this.context = context;
}

util.inherits(CLSampler, CLWrapper);

Object.defineProperties(CLSampler.prototype, {
    _classInfoFunction: {
        get: function () {
            return "clGetSamplerInfo";
        }
    },
    normalizedCoords: {
        get: function () {
            return this._getInfo("bool", this.cl.defs.CL_SAMPLER_NORMALIZED_COORDS);
        }
    },

    addressingMode: {
        get: function () {
            return this._getInfo(this.cl.types.AddressingMode, this.cl.defs.CL_SAMPLER_ADDRESSING_MODE);
        }
    },

    filterMode: {
        get: function () {
            return this._getInfo(this.cl.types.FilterMode, this.cl.defs.CL_SAMPLER_FILTER_MODE);
        }
    }
});

module.exports = CLSampler;