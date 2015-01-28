var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var assert = require('assert');
var CLImage = require('./clImage');
var clUtils = require('./clUtils');

function CLImage2D(context, flags, format, width, height, hostPtr, rowPitch)
{
    hostPtr = hostPtr || null;
    rowPitch = rowPitch || 0;
    var cl = context.cl;

    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateImage2D(clUtils.toHandle(context, 'context'), flags, format.ref(), width, height, rowPitch, clUtils.toPtr(hostPtr, 'hostPtr'), err);
    cl.checkError(err);

    CLImage.call(this, context, handle);
}

CLImage2D._wrap = function(context, readOrWriteOnly, format, width, height, hostPtr, rowPitch) {
    var ptr = clUtils.toPtr(hostPtr, 'hostPtr');
    var flags = context.cl.defs.MEM_USE_HOST_PTR;
    if (readOrWriteOnly === 'readOnly') {
        flags |= context.cl.defs.MEM_READ_ONLY;
    }
    else if (readOrWriteOnly === 'writeOnly') {
        flags |= context.cl.defs.MEM_WRITE_ONLY;
    }
    return new CLImage2D(context, context.cl.defs.MEM_USE_HOST_PTR, format, width, height, hostPtr, rowPitch)
};

CLImage2D.wrap = function(context, format, width, height, hostPtr, rowPitch) {
    return CLImage2D._wrap(context, null, format, width, height, hostPtr, rowPitch);
};

CLImage2D.wrapReadOnly = function(context, format, width, height, hostPtr, rowPitch) {
    return CLImage2D._wrap(context, 'readOnly', format, width, height, hostPtr, rowPitch);
};

CLImage2D.wrapWriteOnly = function(context, format, width, height, hostPtr, rowPitch) {
    return CLImage2D._wrap(context, 'writeOnly', format, width, height, hostPtr, rowPitch);
};

util.inherits(CLImage2D, CLImage);

module.exports = CLImage2D;