"use strict";

/* global describe,it */
var assert = require("assert");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var _ = require("lodash");
var CLContext = nooocl.CLContext;
var scope = nooocl.scope;

function checkContext(context, devices) {
    var formats = context.getSupportedImageFormats(context.cl.defs.CL_MEM_ALLOC_HOST_PTR, context.cl.defs.CL_MEM_OBJECT_IMAGE2D);
    assert(_.isArray(formats));
    assert(formats.length ? true : false);
    if (devices) {
        assert.equal(context.numDevices, devices.length);
        var ctxDevices = context.devices;
        assert(_.isArray(ctxDevices));
        assert.equal(devices.length, ctxDevices.length);
        var props = context.contextProperties;
        assert(props === null || _.isArray(props));
    }
}

describe("CLContext", function() {
    beforeEach(function () {
        scope.begin();
    });

    afterEach(function () {
        scope.end();
    });

    it("should construct from a device", function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var lastErr;
        for (var i = 0; i < platforms.length; i++) {
            try {
                lastErr = null;
                var devices = platforms[i].allDevices();
                assert(_.isArray(devices));
                assert.notEqual(devices.length, 0);
                var context = new CLContext(devices);
                checkContext(context, devices);
                break;
            }
            catch (err) {
                lastErr = err;
            }
        }
        if (lastErr) {
            throw lastErr;
        }
    });

    it("should construct from type", function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var lastErr;
        for (var i = 0; i < platforms.length; i++) {
            try {
                lastErr = null;
                var context = new CLContext(platforms[i], host.cl.defs.CL_DEVICE_TYPE_CPU);
                checkContext(context);
                break;
            }
            catch (err) {
                lastErr = err;
            }
        }
        if (lastErr) {
            throw lastErr;
        }
    });
});
