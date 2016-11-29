"use strict";

var util = require("util");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var CLMemory = require("./clMemory");
var clUtils = require("./clUtils");

function CLBuffer1(context, flags, dataSize, hostPtr) {
    hostPtr = hostPtr || null;
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateBuffer(clUtils.toHandle(context), flags, dataSize, clUtils.toPtr(hostPtr, "hostPtr"), err);
    cl.checkError(err);
    CLMemory.call(this, context, handle);
}

function CLBuffer2(context, handle) {
    CLMemory.call(this, context, handle);
}

function CLBuffer() {
    if (arguments.length === 2) {
        CLBuffer2.apply(this, arguments);
    }
    else {
        CLBuffer1.apply(this, arguments);
    }
}

CLBuffer._wrap = function (context, readOrWriteOnly, hostPtr) {
    var ptr = clUtils.toPtr(hostPtr, "hostPtr");
    var flags = context.cl.defs.CL_MEM_USE_HOST_PTR;
    if (readOrWriteOnly === "readOnly") {
        flags |= context.cl.defs.CL_MEM_READ_ONLY;
    }
    else if (readOrWriteOnly === "writeOnly") {
        flags |= context.cl.defs.CL_MEM_WRITE_ONLY;
    }
    return new CLBuffer(context, flags, ptr.length, ptr);
};

CLBuffer.wrap = function (context, hostPtr) {
    return CLBuffer._wrap(context, null, hostPtr);
};

CLBuffer.wrapReadOnly = function (context, hostPtr) {
    return CLBuffer._wrap(context, "readOnly", hostPtr);
};

CLBuffer.wrapWriteOnly = function (context, hostPtr) {
    return CLBuffer._wrap(context, "writeOnly", hostPtr);
};

util.inherits(CLBuffer, CLMemory);

Object.defineProperties(CLBuffer.prototype, {
    offset: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo("size_t", this.cl.defs.CL_MEM_OFFSET);
        }
    },
    superBuffer: {
        get: function () {
            this._throwIfReleased();
            var subHandle = this._getInfo(this.cl.types.Mem, this.cl.defs.CL_MEM_ASSOCIATED_MEMOBJECT);
            return new CLBuffer(subHandle);
        }
    }
});

CLBuffer.prototype.createSubBuffer = function (flags, origin, size) {
    this._throwIfReleased();
    var reg = new (this.cl.types.BufferRegion)();
    reg.origin = origin;
    reg.size = size;
    var pReg = reg.ref();
    var err = ref.alloc(this.cl.types.ErrorCode);
    var subHandle = this.cl.imports.clCreateSubBuffer(this.handle, flags, this.cl.defs.CL_BUFFER_CREATE_TYPE_REGION, pReg, err);
    this.cl.checkError(err);
    return new CLBuffer(this.context, subHandle);
};

module.exports = CLBuffer;
