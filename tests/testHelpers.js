"use strict";

var nooocl = require("../");
var CLContext = nooocl.CLContext;
var _ = require("lodash");
var assert = require("assert");
var ref = require("ref");

module.exports = {
    createContext: function (host) {
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var devices = platforms[0].allDevices();
        assert(_.isArray(devices));
        assert.notEqual(devices.length, 0);
        var device = devices[0];
        var context = new CLContext(device);
        return {
            device: device,
            context: context
        };
    },
    getContextRefCount: function (host, handle) {
        var info = ref.alloc(ref.types.uint);
        ref.types.uint.set(info, 0, 0);
        var err = host.cl.imports.clGetContextInfo(handle, host.cl.defs.CL_CONTEXT_REFERENCE_COUNT, ref.types.uint.size, info, null);
        host.cl.checkError(err);
        return info.deref();
    },
    getMemRefCount: function (host, handle) {
        var info = ref.alloc(ref.types.uint);
        ref.types.uint.set(info, 0, 0);
        var err = host.cl.imports.clGetMemObjectInfo(handle, host.cl.defs.CL_MEM_REFERENCE_COUNT, ref.types.uint.size, info, null);
        host.cl.checkError(err);
        return info.deref();
    }
};