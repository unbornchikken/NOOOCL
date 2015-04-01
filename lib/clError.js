"use strict";

var util = require("util");
var defs = require("./clDefines");
var _ = require("lodash");

function CLError(code, message) {
    Error.call(this);
    Error.captureStackTrace(this, CLError);
    var typeKey = _.first(_.filter(_.keys(defs), function (defKey) {
        return defs[defKey] === code;
    }));
    var type = typeKey || "UNKNOWN";
    this.name = "CLError";
    this.message = "OpenCL Error Code: " + code + " Type: " + type;
    if (message) {
        this.message += " Message: " + message;
    }
    this.code = code;
    this._type = type;
}

util.inherits(CLError, Error);

module.exports = CLError;
