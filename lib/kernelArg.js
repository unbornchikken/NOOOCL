"use strict";

var clUtils = require("./clUtils");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var _ = require("lodash");

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
        if (this._value !== null) {
            this._value = clUtils.toHandle(this._value);
            this._valueBuffer = ref.alloc(this.kernel.cl.types.Mem);
            ref.set(this._valueBuffer, 0, this._value);
        }
        else {
            this._valueBuffer = null;
        }
        this._set = function () {
            this.kernel.cl.checkError(setArg(this.kernel.handle, this.index, ref.types.size_t.size, this._valueBuffer));
        }.bind(this);
    }
    else if (_.isUndefined(type) || type === null) {
        this.kind = kernelArgKind.localSize;
        this._set = function () {
            this.kernel.cl.checkError(setArg(this.kernel.handle, this.index, this._value, null));
        }.bind(this);
    }
    else {
        this.kind = kernelArgKind._value;
        this._type = ref.coerceType(type);
        this._valueBuffer = ref.alloc(this._type);
        ref.set(this._valueBuffer, 0, this._value);
        this._set = function () {
            this.kernel.cl.checkError(setArg(this.kernel.handle, this.index, this._type.size, this._valueBuffer));
        }.bind(this);
    }

    this._set();
}

KernelArg.kind = kernelArgKind;

Object.defineProperties(KernelArg.prototype, {
    value: {
        get: function () {
            return this._value;
        },
        set: function (to) {
            if (this.kind === kernelArgKind.clObject) {
                if (to === null) {
                    if (this._value === null) {
                        return;
                    }
                    this._value = null;
                    this._set();
                }
                else {
                    to = clUtils.toHandle(to, "to");
                    if (this.value === null || ref.address(this._value) !== ref.address(to)) {
                        this._value = clUtils.toHandle(this._value);
                        ref.set(this._valueBuffer, 0, this._value);
                        this._set();
                    }
                }
            }
            else if (this.kind === kernelArgKind.localSize) {
                if (this._value !== to) {
                    this._value = to;
                    this._set();
                }
            }
            else { // kernelArgKind.value
                if (this._valueBuffer.deref() !== to) {
                    this._value = to;
                    ref.set(this._valueBuffer, 0, this._value);
                    this._set();
                }
            }
        }
    }
});

module.exports = KernelArg;