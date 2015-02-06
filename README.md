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

```javascript
var nooocl = require('nooocl');
var CLHost = nooocl.CLHost;
var CLPlatform = nooocl.CLPlatform;
var CLDevice = nooocl.CLDevice;
var CLContext = nooocl.CLContext;
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var CLUserEvent = nooocl.CLUserEvent;
var NDRange = nooocl.NDRange;
var CLKernel = nooocl.CLKernel;
var CLImage2D = nooocl.CLImage2D;
var CLImage3D = nooocl.CLImage3D;
var CLSampler = nooocl.CLSampler;
```

### 2. Basics

The OpenCL goodness is available through a CLHost instance.

```javascript
host = CLHost.createV11(); // for OpenCL 1.1
host = CLHost.createV12(); // for OpenCL 1.2
host = new CLHost(1.1); // for OpenCL 1.1
```

You will get an exception if there is no compatible OpenCL platform available.

Then you can access to supported platforms:

```javascript
var count = host.platformsCount;
var allPlatforms = host.getPlatforms(); // you will get an array filled with instances of nooocl.CLPlatform class
```
