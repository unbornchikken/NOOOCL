/*jslint node:true,nomen:true,vars:true,plusplus:true,white:true,unparam:true*/
/*jshint onevar:true*/

/*
License: [MIT](../LICENSE)

Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
*/

/*
# NOOOCL API index

Public definitions of the NOOOCL library.
*/

'use strict';

// ## Exported stuff
module.exports = {
    // ### [CLHost](clHost.html)
    // This is the entry point of interacting OpenCL runtime in NOOOCL.
    CLHost: require('./clHost'),
    // ### [CLPlatform](clPlatform.html)
    // Represents an OpenCL platform.
    CLPlatform: require('./clPlatform'),
    CLDevice: require('./clDevice'),
    CLContext: require('./clContext'),
    CLBuffer: require('./clBuffer'),
    CLCommandQueue: require('./clCommandQueue'),
    CLUserEvent: require('./clUserEvent'),
    NDRange: require('./ndRange'),
    CLKernel: require('./clKernel'),
    CLImage2D: require('./clImage2D'),
    CLImage3D: require('./clImage3D'),
    CLSampler: require('./clSampler')
};

/*
## Additional stuff

### [CLWrapper](clWrapper.html)
Base class of OpenCL wrapper classes.
*/