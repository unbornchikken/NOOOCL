var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');

describe('CLHost', function() {
    it('should return platforms', function() {
        var host = CLHost.createV11();
        assert(_.isObject(host));
        
        var count = host.platformsCount;
        assert.notEqual(count, 0, 'There are no OpenCL platforms found.');
        console.log('OpenCL platforms count: ' + count);
    });
});