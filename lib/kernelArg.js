var clUtils = require('./clUtils');
var LocalSize = require('./localSize');
var ref = require('ref');

var kernelArgKind = {
    clObject: 0,
    localSize: 1,
    value: 2
};

function KernelArg(kernel, index, value, type) {
    this.kernel = kernel;
    this.index = index;
    this.kind = 0;
    this._value = value;
    this._type = null;
    this._valueBuffer = null;
    this._set = null;
    var setArg = this.kernel.cl.imports.clSetKernelArg;

    if (this._value === null || clUtils.isHandle(this._value)) {
        this.kind = kernelArgKind.clObject;
        if (this._value !== null) this._value = clUtils.toHandle(this._value);
        this._set = (function() {
            setArg(this.index, ref.types.size_t.size, this._value);
        }).bind(this);
    }
    else if (this._value instanceof LocalSize) {
        this.kind = kernelArgKind.localSize;
        this._set = (function() {
            setArg(this.index, this._value.size, null);
        }).bind(this);
    }
    else {
        this.kind = kernelArgKind._value;
        this._type = ref.coerceType(type);
        this._valueBuffer = ref.alloc(this._type);
        this._valueBuffer.set(0, this._value);
        this._set = (function() {
            setArg(this.index, this._type.size, this._valueBuffer);
        }).bind(this);
    }
}

KernelArg.kind = kernelArgKind;

Object.defineProperties(KernelArg.prototype, {
    value: {
        get: function() {
            return this._value;
        },
        set: function(to) {
            switch(this.kind) {
                case kernelArgKind.clObject:
                {
                    if (to === null) {
                        if (this._value === null) return;
                        this._value = null;
                        this._set();
                    }
                    else {
                        to = clUtils.toHandle(to, 'to');
                        if (this.value === null || ref.address(this._value) !== ref.address(to)) {
                            this._value = null;
                            this._set();
                        }
                    }
                    break;
                }
                case kernelArgKind.localSize:
                {
                    if (!to instanceof LocalSize) throw new TypeError('Value must be a LocalSize object.');
                    if (this._value.size !== to.size) {
                        this._value = to;
                        this._set();
                    }
                    break;
                }
                case kernelArgKind.value:
                {
                    if (this._valueBuffer.deref() !== to) {
                        this._value = to;
                        this._valueBuffer.set(0, to);
                        this._set();
                    }
                    break;
                }
            }
        }
    }
});

module.exports = KernelArg;