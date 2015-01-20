var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var CLEvent = require('./clEvent');

function CLUserEvent(context) {
    var cl = context.cl;
    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateUserEvent(context.handle, err);
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
