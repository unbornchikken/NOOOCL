"use strict";

var types = require("./types");
var fastcall = require("fastcall");
var ref = fastcall.ref;

var clPredef = {
    imageFormat: new (types.ImageFormat)(),
    err: ref.alloc(types.ErrorCode),
    num: ref.alloc("uint")
};

module.exports = clPredef;