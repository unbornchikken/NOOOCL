var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var assert = require('assert');
var CLImage = require('./clImage');
var clUtils = require('./clUtils');

function CLImage2D(context, flags, format, width, height, hostPtr, rowPitch)
{
    hostPtr = hostPtr || null;
    rowPitch = rowPitch || width;
    var cl = context.cl;

    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateImage2D(clUtils.toHandle(context, 'context'), flags, format.ref(), width, height, rowPitch, clUtils.toPtr(hostPtr, 'hostPtr'), err);
    cl.checkError(err);

    CLImage.call(this, cl, handle);
}

util.inherits(CLImage2D, CLImage);

module.exports = CLImage2D;