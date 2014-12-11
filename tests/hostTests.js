var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');

describe('CLHost', function () {
    it('should return platforms', function () {
        var host = CLHost.createV11();
        assert(_.isObject(host));

        var count = host.platformsCount;
        assert.notEqual(count, 0, 'There are no OpenCL platforms found.');

        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.equal(platforms.length, count);

        _.forEach(platforms, function (platform, idx) {
            var info = {
                name: platform.name,
                vendor: platform.vendor,
                clVersion: platform.clVersion,
                profile: platform.profile,
                extensions: platform.extensions
            };

            assert(_.isString(info.name));
            assert.notEqual(info.name.length, 0);
            assert(_.isString(info.vendor));
            assert.notEqual(info.vendor.length, 0);
            assert(_.isString(info.clVersion));
            assert.notEqual(info.clVersion.length, 0);
            assert(_.isString(info.profile));
            assert.notEqual(info.profile.length, 0);
            assert(_.isString(info.extensions));
            assert.notEqual(info.extensions.length, 0);
        });
    });
});