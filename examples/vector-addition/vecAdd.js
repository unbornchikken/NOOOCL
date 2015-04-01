"use strict";

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

var kernelSource = fs.readFileSync(path.join(cwd, "vecAdd.cl"), { encoding: "utf8" });

var host = CLHost.createV11();

var platforms = host.getPlatforms();
var device;
platforms.forEach(function (p) {
    var devices = p.gpuDevices();
    devices.forEach(function (d) {
        device = d;
        return false;
    });
    if (devices) {
        return false;
    }
});
if (!device) {
    return null;
}
var context = new CLContext(device);
return {
    host: host,
    device: device,
    context: context
};

