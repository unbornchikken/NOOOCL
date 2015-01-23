var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var Promise = require('bluebird');
var assert = require('assert');
var CLMemory = require('./clMemory');
var clUtils = require('./clUtils');

function CLBuffer() {
    if (arguments.length === 4) {
        CLBuffer1.apply(this, arguments);
    }
    else if (arguments.length === 2) {
        CLBuffer2.apply(this, arguments);
    }
    else throw new Error('Invalid number of arguments.');
}

function CLBuffer1(context, flags, dataSize, hostPtr) {
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateBuffer(clUtils.toHandle(context), flags, dataSize, clUtils.toPtr(hostPtr, 'hostPtr'), err);
    cl.checkError(err);
    CLMemory.call(this, context, handle);
}

function CLBuffer2(context, handle) {
    CLMemory.call(this, context, handle);
}

util.inherits(CLBuffer, CLMemory);

Object.defineProperties(CLBuffer.prototype, {
    offset: {
        get: function() {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.MEM_OFFSET);
        }
    },
    superBuffer: {
        get: function() {
            this._throwIfReleased();
            var subHandle = this._getInfo(this.cl.types.Mem, this.cl.defs.MEM_ASSOCIATED_MEMOBJECT);
            return new CLBuffer(subHandle);
        }
    }
});

CLBuffer.prototype.createSubBuffer = function(flags, origin, size) {
    this._throwIfReleased();
    var reg = new (this.cl.types.BufferRegion)();
    reg.origin = origin;
    reg.size = size;
    var pReg = reg.ref();
    var err = ref.alloc(this.cl.types.ErrorCode);
    var subHandle = this.cl.imports.clCreateSubBuffer(this.handle, flags, this.cl.defs.BUFFER_CREATE_TYPE_REGION, pReg, err);
    this.cl.checkError(err);
    return new CLBuffer(this.context, subHandle);
};

module.exports = CLBuffer;
