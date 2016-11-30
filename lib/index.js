/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# NOOOCL API index

Public definitions of the NOOOCL library.
*/

"use strict";

var fastcall = require("fastcall");

// ## Exported stuff
module.exports = {
    // ### [CLHost](clHost.html)
    // This is the entry point of interacting OpenCL runtime in NOOOCL.
    CLHost: require("./clHost"),

    // ### [CLPlatform](clPlatform.html)
    // Represents an OpenCL platform.
    CLPlatform: require("./clPlatform"),

    // ### [CLDevice](clDevice.html)
    // Represents an OpenCL device.
    CLDevice: require("./clDevice"),

    // ### [CLContext](clContext.html)
    // Represents an OpenCL context.
    CLContext: require("./clContext"),

    CLBuffer: require("./clBuffer"),
    CLCommandQueue: require("./clCommandQueue"),
    CLUserEvent: require("./clUserEvent"),
    NDRange: require("./ndRange"),
    CLProgram: require("./clProgram"),
    CLKernel: require("./clKernel"),
    CLImage2D: require("./clImage2D"),
    CLImage3D: require("./clImage3D"),
    CLSampler: require("./clSampler"),
    CLError: require("./clError"),
    scope: fastcall.scope
};

/*
## Additional stuff

### [CLWrapper](clWrapper.html)
Base class of OpenCL wrapper classes.
*/