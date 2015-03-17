"use strict";

var util = require("util");
var CLImage = require("./clImage");
var clUtils = require("./clUtils");
var clPredef = require("./clPredef");

function CLImage3D(context, flags, format, width, height, depth, hostPtr, rowPitch, slicePitch) {
    format = clUtils.asImageFormat(format);
    hostPtr = hostPtr || null;
    rowPitch = rowPitch || 0;
    slicePitch = slicePitch || 0;
    var cl = context.cl;

    var err = clPredef.err;
    var handle = cl.imports.clCreateImage3D(clUtils.toHandle(context, "context"), flags, format.ref(), width, height, depth, rowPitch, slicePitch, clUtils.toPtr(hostPtr, "hostPtr"), err);
    cl.checkError(err);

    CLImage.call(this, context, handle);
}

util.inherits(CLImage3D, CLImage);

module.exports = CLImage3D;