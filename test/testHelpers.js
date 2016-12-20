"use strict";

var nooocl = require("../");
var CLHost = nooocl.CLHost;
var CLContext = nooocl.CLContext;
var _ = require("lodash");
var assert = require("assert");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var Bluebird = require("bluebird");

var gpuWarn = false;

var testHelpers = {
    doTest: function (testMethod, version) {
        return Bluebird.try(function () {
            version = version || CLHost.supportedVersions.cl11;
            var host = new CLHost(version);
            return testHelpers.createEnvironment(host);
        });
    },
    createEnvironment: function (host, hardware) {
        assert(_.isObject(host));
        if (!hardware) {
            var env = testHelpers.createEnvironment(host, "cpu");
            if (env) {
                return env;
            }
            env = testHelpers.createEnvironment(host, "gpu");
            if (env) {
                return env;
            }
        }
        hardware = (hardware || "cpu").toLowerCase();
        var platforms = host.getPlatforms();
        var device;
        platforms.forEach(function (p) {
            var devices = hardware === "gpu" ? p.gpuDevices() : p.cpuDevices();
            if (devices.length) {
                device = devices[0];
            }
            if (device) {
                return false;
            }
        });
        if (!device) {
            throw new Error("No OpenCL device available.");
        }
        var context = new CLContext(device);
        return {
            host: host,
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

module.exports = testHelpers;