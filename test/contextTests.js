"use strict";

/* global describe,it */
var assert = require("assert");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var _ = require("lodash");
var CLContext = nooocl.CLContext;

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
    it("should construct from a device", function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var devices = platforms[0].allDevices();
        assert(_.isArray(devices));
        assert.notEqual(devices.length, 0);
        var context = new CLContext(devices);
        checkContext(context, devices);
    });

    it("should construct from type", function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var context = new CLContext(platforms[0], host.cl.defs.CL_DEVICE_TYPE_CPU);
        checkContext(context);
    });
});
