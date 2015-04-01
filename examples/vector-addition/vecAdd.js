"use strict";

// Dependency:
var fs = require("fs");
var path = require("path");
var cwd = __dirname;
var nooocl = require("../../");
var CLHost = nooocl.CLHost;
var CLPlatform = nooocl.CLPlatform;
var CLDevice = nooocl.CLDevice;
var CLContext = nooocl.CLContext;
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var CLUserEvent = nooocl.CLUserEvent;
var NDRange = nooocl.NDRange;
var CLProgram = nooocl.CLProgram;
var CLKernel = nooocl.CLKernel;
var CLImage2D = nooocl.CLImage2D;
var CLImage3D = nooocl.CLImage3D;
var CLSampler = nooocl.CLSampler;
var ref = require("ref");
var double = ref.double;

// Load the kernel source:
var kernelSource = fs.readFileSync(path.join(cwd, "vecAdd.cl"), { encoding: "utf8" });

// Initialize OpenCL then we get host, device, context, and a queue
var host = CLHost.createV11();
var defs = host.cl.defs;

var platforms = host.getPlatforms();
var device;
function searchForDevice (hardware) {
    platforms.forEach(function (p) {
        var devices = hardware === "gpu" ? p.gpuDevices() : p.cpuDevices();
        if (devices.length) {
            device = devices[0];
        }
        if (device) {
            return false;
        }
    });
}

searchForDevice("gpu");
if (!device) {
    console.warn("No GPU devices has been found, searching for a CPU fallback.");
    searchForDevice("cpu");
}

if (!device) {
    throw new Error("No capable OpenCL 1.1 device has been found.");
}
else {
    console.log("Running on device: " + device.name + " - " + device.platform.name);
}

var context = new CLContext(device);
var queue = new CLCommandQueue(context, device);

// Initialize data on the host side:
var n = 1000;
var bytes = n * double.size;

var h_a = new Buffer(n * double.size);
var h_b = new Buffer(n * double.size);
var h_c = new Buffer(n * double.size);

// Initialize vectors on host
for (var i = 0; i < n; i++) {
    var offset = i * double.size;
    double.set(h_a, offset, Math.sin(i) * Math.sin(i));
    double.set(h_b, offset, Math.cos(i) * Math.cos(i));
}

// Create device memory buffers
var d_a = new CLBuffer(context, defs.CL_MEM_READ_ONLY, bytes);
var d_b = new CLBuffer(context, defs.CL_MEM_READ_ONLY, bytes);
var d_c = new CLBuffer(context, defs.CL_MEM_WRITE_ONLY, bytes);

// Bind memory buffers
queue.enqueueWriteBuffer(d_a, 0, bytes, h_a);
queue.enqueueWriteBuffer(d_b, 0, bytes, h_b);
