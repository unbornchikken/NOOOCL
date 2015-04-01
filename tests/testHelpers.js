"use strict";

var nooocl = require("../");
var CLHost = nooocl.CLHost;
var CLContext = nooocl.CLContext;
var _ = require("lodash");
var assert = require("assert");
var ref = require("ref");
var Bluebird = require("bluebird");

var gpuWarn = false;

var testHelpers = {
    doTest: function (testMethod, version) {
        version = version || CLHost.supportedVersions.cl11;
        var host = new CLHost(version);
        var cpuEnv = testHelpers.createEnvironment(host, "cpu");
        var cpuTestResult = cpuEnv ? testMethod(cpuEnv) : Bluebird.resolve();
        var gpuEnv = testHelpers.createEnvironment(host, "gpu");
        if (gpuEnv) {
            console.log(require("util").inspect(gpuEnv.device));
            return cpuTestResult.then(function () {
                return testMethod(gpuEnv);
            });
        }
        if (!gpuWarn) {
            console.warn("GPU is not available!");
            gpuWarn = true;
        }
        return cpuTestResult;
    },
    createEnvironment: function (host, hardware) {
        assert(_.isObject(host));
        hardware = (hardware || "cpu").toLowerCase();
        var platforms = host.getPlatforms();
        var device;
        platforms.forEach(function (p) {
            var devices = hardware === "gpu" ? p.gpuDevices() : p.cpuDevices();
            devices.forEach(function (d) {
                device = d;
                return false;
            });
            if (device) {
                return false;
            }
        });
        if (!device) {
            return null;
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