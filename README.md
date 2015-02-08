# NOOOCL (MIT)
Node.js Object Oriented OpenCL Bindings

[![bitHound Score](https://www.bithound.io/unbornchikken/NOOOCL/badges/score.svg)](https://www.bithound.io/unbornchikken/NOOOCL)

## About

This is a full featured OpenCL wrapper library for Node.js. It supports full 1.1 and 1.2 specifications.
Despite it's an OOP wrapper, **the whole C API available** by [ffi](https://www.npmjs.com/package/ffi), and can be called by using [ref and co](https://www.npmjs.com/package/ref).

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

we will get an exception if there is no compatible OpenCL platform available.

CLHost and all of CL* class instances share this common, important properties:

- **cl.version**: version of the OpenCL platform
- **cl.defs.xxx**: predefined OpenCL values, like: CL_MEM_COPY_HOST_PTR, CL_DEVICE_MAX_COMPUTE_UNITS. See the OpenCL specification or [NOOOCL/lib/cl/clDefines.js](https://github.com/unbornchikken/NOOOCL/blob/master/lib/cl/clDefines.js).
- **cl.imports.clxxx**: this is where OpenCL C API is imported with ffi, we can call native API methods like clEnqueueCopyBuffer, clEnqueueNDRangeKernel and co.
- **cl.types.xxx**: [ref](https://www.npmjs.com/package/ref) compatible OpenCL type definitions, see the complete list there: [NOOOCL/lib/cl/types.js](https://github.com/unbornchikken/NOOOCL/blob/master/lib/cl/types.js).

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

Then we can access to supported platforms:

```javascript
var count = host.platformsCount;

// we will get an array filled with instances of nooocl.CLPlatform class
var allPlatforms = host.getPlatforms();
```

For each platform we can access its information in JS properties:

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

we can query available devices:

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

we will get an array of nooocl.CLDevice class instances. CLDevice can provide all OpenCL device information in simple JavaScript properties, for example:

```javascript
var cpuDevice = platform.cpuDevices()[0];

// we get the value of CL_DEVICE_MAX_COMPUTE_UNITS:
var maxComputeUnits = cpuDevice.maxComputeUnits;

// we get the value of CL_DEVICE_MAX_WORK_ITEM_SIZES in an array like: [256, 64, 1]:
var maxWorkItemSizes = cpuDevice.maxWorkItemSizes;
```

Please see the API docs or [NOOOCL/tests/hostTests.js](https://github.com/unbornchikken/NOOOCL/blob/master/tests/hostTests.js) unit test for complete list of available device info properties.

Ok, we have a host, a platform, a device, now we need a context. we can create it from a CLDevice instance, from an array of CLDevice instances, or from a CLPlatform instance and a device type, like:

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

The last thing that we need in every OpenCL application is the command queue. we can create a queue for a device by calling CLCommandQueue class' constructor:

```javascript
// The last two parameters are optional, their defaults are false:
var queue = new CLCommandQueue(context, cpuDevice, isOutOfOrder, isProfilingEnabled);
```

CLCommandQueue implements every clEnqueue* method but names modified slightly, like: clEnqueueMarker becomes enqueueMarker, clEnqueueNDRangeKernel becomes enqueueNDRangeKernel, and so on.
Please see the API docs further details.

The queue has two modes. Waitable and non waitable. A queue initially is non waitable.
If the queue is non waitable its enqueue* methods return undefined, if waitable enqueue* methods return a CLEvent instance which have a _promise_ property of type [bluebird promise](https://www.npmjs.com/package/bluebird).
we can switch modes by calling waitable method, which accepts an optional boolean parameter. When its true, the result queue will be waitable, if false, the result queue will be non waitable. Default value is true.

Example:

```javascript
var queue = new CLCommandQueue(context, device); // It's non waitable.

// Fire and forget a kernel:
queue.enqueueNDRangeKernel(kernel, new NDRange(10));

// Read its result asynchronously:
queue.waitable().enqueueReadBuffer(
    openCLBuffer,
    0,
    size_in_bytes,
    destNodeJSBuffer).promise
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
var openCLBuffer = new CLBuffer(
    context,
    host.cl.defs.CL_MEM_ALLOC_HOST_PTR,
    size_in_bytes_here);
```

we can copy data into this buffer, and copy data from it into Node.js memory.

```javascript
var destBuffer = new Buffer(openCLBuffer.size);
queue.waitable().enqueueReadBuffer(
    openCLBuffer,
    0,
    openCLBuffer.size,
    destBuffer).promise
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

OpenCL buffers can be initialized by copying values from an already initialized Node.js Buffer.

```javascript
var float = ref.types.float;
var nodeBuffer = new Buffer(float.size * 3);
float.set(nodeBuffer, 0, 1.1);
float.set(nodeBuffer, float.size, 2.2);
float.set(nodeBuffer, float.size * 2, 3.3);
var openCLBuffer = new CLBuffer(
    context,
    host.cl.defs.CL_MEM_COPY_HOST_PTR,
    nodeBuffer.length,
    nodeBuffer);
var otherBuffer = new Buffer(nodeBuffer.length);
queue.waitable().enqueueReadBuffer(
    openCLBuffer,
    0,
    openCLBuffer.
    size,
    otherBuffer).promise
    .then(function () {
        // OpenCL buffer's data are copied to otherBuffer, check;
        for (var i = 0; i < otherBuffer.length; i++) {
            assert.equal(otherBuffer[i], nodeBuffer[i]);
        }
    });
```

#### Use

OpenCL can use Node.js buffers directly. It is safe to access its content only after a mapping operation.

```javascript
var float = ref.types.float;
var nodeBuffer = new Buffer(float.size * 3);
float.set(nodeBuffer, 0, 1.1);
float.set(nodeBuffer, float.size, 2.2);
float.set(nodeBuffer, float.size * 2, 3.3);

var openCLBuffer = new CLBuffer(
    context,
    host.cl.defs.CL_MEM_USE_HOST_PTR,
    nodeBuffer.length,
    nodeBuffer);

// We can use the following shortcut syntax instead of the above constructor call:
// var openCLBuffer = CLBuffer.wrap(context, nodeBuffer);

var otherBuffer = new Buffer(nodeBuffer.length);
var out = {};
queue.enqueueMapBuffer(
    openCLBuffer,
    host.cl.defs.CL_MAP_READ | host.cl.defs.CL_MAP_WRITE,
    1 * float.size, // offset
    2 * float.size, // size
    out).promise
    .then(function() {
        // out.ptr holds the mapped ptr address of ref type void*
        // since we've requested the pointer from byte offset float.size,
        // and OpenCL uses nodeBuffer's memory as host side pointer,
        // then the following assertion holds:
        assert.equal(
            ref.address(out.ptr),
            ref.address(nodeBuffer) + float.size);

        // We should reinterpret result ptr to a usable sized buffer with ref:
        var mappedBuffer = ref.reinterpret(out.ptr, 2 * float.size, 1 * float.size);

        // Now we're using the same memory for sure:
        for (var i = 0; i < mappedBuffer.length; i++) {
            assert.equal(otherBuffer[i], nodeBuffer[i + float.size]);
        }

        // Why out.ptr if we have access the original buffer?
        // That's because mapping is available for OpenCL allocated buffers as well,
        // if CL_MEM_ALLOC_HOST_PTR flags is used only,
        // or CL_MEM_USE_HOST_PTR flag is set along with CL_MEM_COPY_HOST_PTR

        // ...

        // After doing stuff, we have to unmap memory:
        queue.enqueueUnmapMemory(openCLBuffer, out.ptr);
    });
```

#### Images

2D and 3D images are also supported in NOOOCL. There is a unit test that shows how we can do OpenCL accelerated image grayscale conversion in NOOOCL,
please take a look at it there: [NOOOCL/tests/imageTests.js](https://github.com/unbornchikken/NOOOCL/blob/beta-dev/tests/imageTests.js).

Fist, we should open the image and access to its raw RGBA data in a Node.js buffer. Any appropriate npm module can be used there (I suggest [lwip](https://github.com/EyalAr/lwip)).

Then we can create and OpenCL image from it:

```javascript
var ImageFormat = host.conel.types.ImageFormat;
var format = new ImageFormat({
    imageChannelOrder: host.cl.defs.CL_RGBA,
    imageChannelDataType: host.cl.defs.CL_UNSIGNED_INT8
});

// Wrap means CL_MEM_USE_HOST_PTR
var src = CLImage2D.wrapReadOnly(
    context,
    format,
    inputImage.width,
    inputImage.height,
    inputImage.data);
```

Please refer to the API docs for further details.

### 3. Program

#### Build

OpenCL programs can be compiled from string source code or loaded from precompiled binaries, these methods are supported in NOOOCL.

```javascript
// Creating OpenCL program from string source:
var source = 'kernel void foo(global float* data) { }';
var program = context.createProgram(source);

// Everything is asynchronous in Node.js:
program.build('-cl-fast-relaxed-math').then(
    function() {
        // At this point we don't know that the build succeeded or failed.
        // Since one context can hold multiple devices,
        // and a build could succeeded on a device, but could failed on the other,
        // NOOOCL won't raise build errors, we should asks for it per device basis:

        // can be either: CL_BUILD_SUCCESS, CL_BUILD_ERROR
        var buildStatus = program.getBuildStatus(device);

        // Compiler output:
        var buildLog = program.getBuildLog(device);
    });
```

After a program builds we can access it's binaries for each device:

```javascript
// This returns an array of CLDevice instances
var devices = program.devices;

// This returns an array of Buffer instances
var binaries = program.getBinaries();

// According to the OpenCL Specification:
// "Each entry in this array is used by the implementation
// as the location in memory where to copy the program binary for a specific device,
// if there is a binary available. To find out which device
// the program binary in the array refers to,
// use the CL_PROGRAM_DEVICES query to get the list of devices.
// There is a one-to-one correspondence between the array of n pointers
// returned by CL_PROGRAM_BINARIES and array of devices
// returned by CL_PROGRAM_DEVICES."

// So we can zip the above:
var deviceBinaries =
    _.zip(devices, binaries)
    .map(function(a) { return { device: a[0], binary: a[1] }; );
```

Binaries could be stored in files for example, so when the application executes next time,
there slow build from source process won't be necessary.

```javascript
// Creating program from binaries:

// This creates a Buffer instance:
var binary = fs.readFileSync('/tmp/foo.bin');

var program = context.createProgram(binary, device);

// We should call build,
// but this time it will be much faster than compiling from source:
program.build().then(
    function() {
        // can be either: CL_BUILD_SUCCESS, CL_BUILD_ERROR
        var buildStatus = program.getBuildStatus(device);

        // Compiler output:
        var buildLog = program.getBuildLog(device);

        // ...
    });
```

#### Kernel

We can create kernel by name, or can create all kernels in the program at once.

```javascript
// By name:
doStuffKernel = program.createKernel('doStuff');

// All. This time the return values is an array of CLKernel instances.
var kernels = program.createAllKernels();
doStuffKernel = _.first(_.where(kernels, { name: 'doStuff' }));
```

We can set its arguments by index, or all at once:

```javascript
// Assume we have a kernel of the following signature:
// kernel void doStuff(global float* data, uint someValue, local float* tmp) {...}
// and a CLBuffer instance created like:
// var openCLBuffer = CLBuffer.wrap(context, nodeBuffer);


var kernel = program.createKernel('doStuff');

// We can set kernel's arguments by index:

// For buffer arguments we can pass the instance of a CLBuffer class:
kernel.setArg(0, openCLBuffer);
// or native cl_mem handle
// kernel.setArg(0, openCLBuffer.handle);

// For constant arguments we have to specify its type
kernel.setArg(1, 55, 'uint');

// For local buffers, we have to specify its size in bytes
kernel.setArg(2, 100 * float.size);

// Or we can specify all of the arguments at once:

kernel.setArgs(openCLBuffer, {'uint': 55}, 100 * float.size);
```

Now we can enqueue the kernel. In NOOOCL there is an NDRange class, for defining OpenCL ranges.

```javascript
// 1 dimension range:
var r1 = new NDRange(10);

// 2 dimensions range:
var r2 = new NDRange(10, 20);

// 3 dimensions range
var r3 = new NDRange(10, 20, 30);
```

So the enqueuing is really simple:

```javascript
queue.enqueueNDRangeKernel(
    kernel,
    new NDRange(3), // global size
    null, // local size
    new NDRange(1) // offset
);
```

We can create a simple JavaScript function for calling OpenCL kernels with ad-hoc arguments by using the bind method:

```javascript
var func = kernel.bind(
    queue, // command queue to use
    new NDRange(3), // global size
    null, // local size
    new NDRange(1)); // offset

// Now we have a JS function to call (aka set arguments and enqueue)
// our OpenCL kernel!
// It's easy as goblin pie.
func(openCLBuffer, {'uint': 55}, 100 * float.size);
```

### 4. API

[In progress.](http://unbornchikken.github.io/NOOOCL/)

### 5. Examples

TODO (I'm gonna try to make some particle simulation demo in node-webkit)