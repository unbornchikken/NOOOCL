# NOOOCL (MIT)
Node.js Object Oriented OpenCL Bindings

[![bitHound Score](https://www.bithound.io/unbornchikken/NOOOCL/badges/score.svg)](https://www.bithound.io/unbornchikken/NOOOCL)

## About

This is a full featured OpenCL wrapper library for Node.js. It supports full 1.1 and 1.2 specifications. Despite it's an OOP wrapper, **the whole C API available** by [ffi](https://www.npmjs.com/package/ffi), and can be called by using [ref and co](https://www.npmjs.com/package/ref).

## Usage

### 1. Install

NPM:

    npm install nooocl

JavaScript:

    var nooocl = require('nooocl');
    var CLHost = nooocl.CLHost;
    var CLPlatform: require('./lib/clPlatform'),
    var CLDevice: require('./lib/clDevice'),
    var CLContext: require('./lib/clContext'),
    var CLBuffer: require('./lib/clBuffer'),
    var CLCommandQueue: require('./lib/clCommandQueue'),
    var CLUserEvent: require('./lib/clUserEvent'),
    var NDRange: require('./lib/ndRange'),
    var CLKernel: require('./lib/clKernel'),
    var CLImage2D: require('./lib/clImage2D'),
    var CLImage3D: require('./lib/clImage3D'),
    var CLSampler: require('./lib/clSampler')

### 2. API

The OpenCL goodness is available through a CLHost
