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
    });
});
