var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var assert = require('assert');
var CLImage = require('./clImage');
var clUtils = require('./clUtils');

function CLImage3D(context, flags, format, width, height, depth, hostPtr, rowPitch, slicePitch)
{
    hostPtr = hostPtr || null;
    rowPitch = rowPitch || width;
    slicePitch = slicePitch || (height * rowPitch);
    var cl = context.cl;

    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateImage3D(clUtils.toHandle(context, 'context'), flags, format.ref(), width, height, depth, rowPitch, slicePitch, clUtils.toPtr(hostPtr, 'hostPtr'), err);
    cl.checkError(err);

    CLImage.call(this, cl, handle);
}

util.inherits(CLImage3D, CLImage);

module.exports = CLImage3D;