"use strict";

var util = require("util");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var CLEvent = require("./clEvent");
var clUtils = require("./clUtils");

function CLUserEvent(context) {
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateUserEvent(clUtils.toHandle(context), err);
    cl.checkError(err);
    CLEvent.call(this, cl, handle);
}

util.inherits(CLUserEvent, CLEvent);

CLUserEvent.prototype.setStatus = function(status) {
    this._throwIfReleased();
    var err = this.cl.imports.clSetUserEventStatus(this.handle, status);
    this.cl.checkError(err);
};

module.exports = CLUserEvent;
