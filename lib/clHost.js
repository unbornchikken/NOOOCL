/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# CLHost class

This is the entry point of interacting OpenCL runtime in NOOOCL.

**base:** Object

**Properties:**
- [supportedVersions (static)](#supportedversions)
- [version](#version)
- [cl](#cl)
- [platformsCount](#platformscount)

**Methods:**
- [constructor](#constructor)
- [createV11 (static)](#createv11)
- [createV12 (static)](#createv12)
- [getPlatforms](#getplatforms)
*/

"use strict";
var _ = require("lodash");
var CL11 = require("./cl11");
var CL12 = require("./cl12");
var CLPlatform = require("./clPlatform");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var assert = require("assert");

/*
## constructor

**arguments:**
- **version:** version of the OpenCL runtime, can be number value of 1.1 or 1.2.
*/
function CLHost(version) {
    assert(_.includes(_.values(CLHost.supportedVersions), version), "Argument 'version' is invalid or not supported.");

    // ## version
    // version of the OpenCL runtime, can be number value of 1.1 or 1.2.
    this.version = version;

    // ## cl
    // instance of the [CL11](cl11.html) or [CL12](cl12.html) class, depending the version of the OpenCL runtime.
    this.cl = null;
    if (version === CLHost.supportedVersions.cl11) {
        this.cl = new CL11();
    }
    else if (version === CLHost.supportedVersions.cl12) {
        this.cl = new CL12();
    }
    else {
        throw new Error("Unknown version: " + version);
    }
}

// ## supportedVersions
// Object defining the supported OpenCL runtime versions of the NOOOCL library
CLHost.supportedVersions = {
    cl11: 1.1,
    cl12: 1.2
};

Object.defineProperties(CLHost.prototype, {
    _nPlatformsCount: {
        get: function () {
            var num = ref.alloc("uint");

            // _OpenCL API:_ [clGetPlatformIDs](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/clGetPlatformIDs.html)
            var err = this.cl.imports.clGetPlatformIDs(0, null, num);

            this.cl.checkError(err);
            return num;
        }
    },
    // ## platformsCount
    // Number of OpenCL platforms available.
    platformsCount: {
        get: function () {
            return this._nPlatformsCount.deref();
        }
    }
});

// ## createV11
// Creates a host instance for the OpenCL 1.1 runtime.
CLHost.createV11 = function () {
    return new CLHost(CLHost.supportedVersions.cl11);
};

// ## createV12
// Creates a host instance for the OpenCL 1.2 runtime if it is supported by the actual hardware.
CLHost.createV12 = function () {
    return new CLHost(CLHost.supportedVersions.cl12);
};

/* ## getPlatforms
Returns OpenCL platforms available.

**Result:**

Array of [CLPlatform](clPlatform.html) instances.
*/
CLHost.prototype.getPlatforms = function () {
    var i;
    var count = this._nPlatformsCount;
    var nCount = count.deref();
    var plaformIds = new (this.cl.types.PlatformIdArray)(nCount);

    // _OpenCL API:_ [clGetPlatformIDs](https://www.khronos.org/registry/cl/sdk/1.1/docs/man/xhtml/clGetPlatformIDs.html)
    var err = this.cl.imports.clGetPlatformIDs(plaformIds.length, plaformIds, count);

    this.cl.checkError(err);
    var platforms = [];
    for (i = 0; i < nCount; i++) {
        platforms.push(new CLPlatform(this.cl, plaformIds.get(i)));
    }
    return platforms;
};

module.exports = CLHost;
