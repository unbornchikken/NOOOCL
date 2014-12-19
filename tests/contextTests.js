var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');
var CLContext = nooocl.CLContext;

describe('CLContext', function() {
    it('should construct from a device', function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var devices = platforms[0].allDevices();
        assert(_.isArray(devices));
        assert.notEqual(devices.length, 0);
        var context = new CLContext(devices);
        checkContext(context);
    });

    it('should construct from type', function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.notEqual(platforms.length, 0);
        var context = new CLContext(platforms[0], host.cl.defs.DEVICE_TYPE_CPU);
        checkContext(context);
    });
});

// Helpers

function checkContext(context) {
    var formats = context.supportedImageFormats(context.cl.defs.MEM_ALLOC_HOST_PTR, context.cl.defs.MEM_OBJECT_IMAGE2D);
    assert(_.isArray(formats));
    assert(formats.length ? true : false);
}
