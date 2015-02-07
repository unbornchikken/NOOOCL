# NOOOCL (MIT)
Node.js Object Oriented OpenCL Bindings

[![bitHound Score](https://www.bithound.io/unbornchikken/NOOOCL/badges/score.svg)](https://www.bithound.io/unbornchikken/NOOOCL)

## About

This is a full featured OpenCL wrapper library for Node.js. It supports full 1.1 and 1.2 specifications. Despite it's an OOP wrapper, **the whole C API available** by [ffi](https://www.npmjs.com/package/ffi), and can be called by using [ref and co](https://www.npmjs.com/package/ref).

## Install

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

## Tutorial

### 1. Basics

#### Host

The OpenCL goodness is available through a CLHost instance.

```javascript
host = CLHost.createV11(); // for OpenCL 1.1
host = CLHost.createV12(); // for OpenCL 1.2
host = new CLHost(1.1); // for OpenCL 1.1
host = new CLHost(1.2); // for OpenCL 1.2
```

You will get an exception if there is no compatible OpenCL platform available.

CLHost and all of CL* class instances share this common, important properties:

- **cl.version**: version of the OpenCL platform
- **cl.defs.xxx**: predefined OpenCL values, like: CL_MEM_COPY_HOST_PTR, CL_DEVICE_MAX_COMPUTE_UNITS. See the OpenCL specification or [NOOOCL/lib/cl/defs.js](https://github.com/unbornchikken/NOOOCL/blob/master/lib/cl/defs.js).
- **cl.imports.clxxx**: this is where OpenCL C API is imported with ffi, you can call native API methods like clEnqueueCopyBuffer, clEnqueueNDRangeKernel and co.

Example:

```javascript
var hostVersion = host.cl.version;

var someOpenCLValue = host.cl.defs.CL_MEM_COPY_HOST_PTR;

var err = host.cl.imports.clEnqueueNDRangeKernel(
    queue.handle,
    kernel.handle,
    1,
    null,
    global.size,
    null,
    0,
    null,
    null);
```

#### Platforms

Then you can access to supported platforms:

```javascript
var count = host.platformsCount;

// you will get an array filled with instances of nooocl.CLPlatform class
var allPlatforms = host.getPlatforms();
```

For each platform you can access its information in JS properties:

```javascript
var platform = host.getPlatforms()[0]; // First platform

var info = {
    name: platform.name,
    vendor: platform.vendor,
    clVersion: platform.clVersion,
    profile: platform.profile,
    extensions: platform.extensions
};
```

CLPlatform and all CL* class instances except CLHost share the *handle* property, which holds the value of cl_platform_id, cl_command_queue, cl_kernel, etc, OpenCL native handles.
These handles will be automatically released during garbage collection, rr they can be released explicitly by calling release method.

#### Devices

You can query available devices:

```javascript
var all = platform.allDevices();

var cpus = platform.cpuDevices();

var gpus = platform.gpuDevices();

var accels = platform.accelDevices();

var gpusAndCpus =
    platform.getDevices(
        platform.cl.defs.CL_DEVICE_TYPE_GPU |
        platform.cl.defs.CL_DEVICE_TYPE_CPU);
```

You will get an array of nooocl.CLDevice class instances. CLDevice can provide all OpenCL device information in simple JavaScript properties, for example:

```javascript
var cpuDevice = platform.cpuDevices()[0];

// You get the value of CL_DEVICE_MAX_COMPUTE_UNITS:
var maxComputeUnits = cpuDevice.maxComputeUnits;

// You get the value of CL_DEVICE_MAX_WORK_ITEM_SIZES in an array like: [256, 64, 1]:
var maxWorkItemSizes = cpuDevice.maxWorkItemSizes;
```

Please see the API docs or [NOOOCL/tests/hostTests.js](https://github.com/unbornchikken/NOOOCL/blob/master/tests/hostTests.js) unit test for complete list of available device info properties.

Ok, you have a host, a platform, a device, now you need a context. You can create it from a CLDevice instance, from an array of CLDevice instances, or from a CLPlatform instance and a device type, like:

```javascript
// Create content for a single device:
var cpuDevice = platform.cpuDevices()[0];
context = new CLContext(cpuDevice);

// Create context for multiple devices:
var gpusAndCpus =
    platform.getDevices(
        platform.cl.defs.CL_DEVICE_TYPE_GPU |
        platform.cl.defs.CL_DEVICE_TYPE_CPU);
context = new CLContext(gpusAndCpus);

// Create context for a platform's devices:
context = new CLContext(platform, platform.cl.defs.CL_DEVICE_TYPE_GPU);
```

#### The Queue

The last thing that you need in every OpenCL application is the command queue. You can create a queue for a device by calling CLCommandQueue class' constructor:

```javascript
// The last two parameters are optional, their defaults are false:
var queue = new CLCommandQueue(context, cpuDevice, isOutOfOrder, isProfilingEnabled);
```

CLCommandQueue implements every clEnqueue* method but names modified slightly, like: clEnqueueMarker becomes enqueueMarker, clEnqueueNDRangeKernel becomes enqueueNDRangeKernel, and so on.
Please see the API docs further details.

The queue has two modes. Waitable and non waitable. A queue initially is non waitable.
If the queue is non waitable its enqueue* methods return undefined, if waitable enqueue* methods return a CLEvent instance which have a _promise_ property of type [bluebird promise](https://www.npmjs.com/package/bluebird).
You can switch modes by calling waitable method, which accepts an optional boolean parameter. When its true, the result queue will be waitable, if false, the result queue will be non waitable. Default value is true.

Example:

```javascript
var queue = new CLCommandQueue(context, device); // It's non waitable.

// Fire and forget a kernel:
queue.enqueueNDRangeKernel(kernel, new NDRange(10));

// Read its result asynchronously:
queue.waitable().enqueueReadBuffer(openCLBuffer, 0, size_in_bytes, destNodeJSBuffer).promise
  .then(function () {
     // Data is copied into host's destNodeJSBuffer from the device
  });
```

Please note *there is no synchronous operations in NOOOCL*, because those kill the event loop.

### 2. Memory

NOOOCL uses [standard Node.js Buffer](http://nodejs.org/api/buffer.html) for memory pointers. Raw memory operations, like reinterpreting are implemented by using [ref and co](https://www.npmjs.com/package/ref).

#### Allocate

OpenCL runtime can allocate memory if requested.

```javascript
var openCLBuffer = new CLBuffer(context, host.cl.defs.CL_MEM_ALLOC_HOST_PTR, size_in_bytes_here);
```

You can copy data into this buffer, and copy data from it into Node.js memory.

```javascript
var destBuffer = new Buffer(openCLBuffer.size);
queue.waitable().enqueueReadBuffer(openCLBuffer, 0, openCLBuffer.size, destBuffer).promise
    .then(function () {
        //destBuffer holds the data

        // setting some values at Node.js side
        ref.types.float.set(destBuffer, 0, 1.1);
        ref.types.float.set(destBuffer, 1 * ref.types.float.size, 1.1);

        // copy data back to OpenCL memory:
        queue.enqueueWriteBuffer(openCLBuffer, 0, openCLBuffer.size, destBuffer);
    });
```

#### Copy

#### Use

#### Images

.... in progress ....