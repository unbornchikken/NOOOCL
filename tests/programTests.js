var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');
var CLContext = nooocl.CLContext;

var source = 'kernel void foo(global float* data) { }';

var badSource = 'da shit';

describe('CLContext', function() {
    it('should build and get kernel from string source', function(done) {
        var host = CLHost.createV11();
        var ctx = createContext(host);
        var context = ctx.context;
        var device = ctx.device;
        var program = context.createProgram(source);
        var buildStatus = program.getBuildStatus(device);
        var buildOptions = program.getBuildOptions(device);
        var buildLog = program.getBuildLog(device);
        assert.equal(buildStatus, host.cl.defs.BUILD_NONE);
        assert.equal(buildOptions, '');
        assert(_.isString(buildLog));
        program.build('-cl-fast-relaxed-math').then(
            function() {
                buildStatus = program.getBuildStatus(device);
                buildOptions = program.getBuildOptions(device);
                buildLog = program.getBuildLog(device);
                assert.equal(buildStatus, host.cl.defs.BUILD_SUCCESS);
                assert.equal(buildOptions, '-cl-fast-relaxed-math');
                assert(_.isString(buildLog));
            }).nodeify(done);
    });

    it('should fail by building a fucked up string source', function(done) {
        var host = CLHost.createV11();
        var ctx = createContext(host);
        var context = ctx.context;
        var device = ctx.device;
        var program = context.createProgram(badSource);
        var buildStatus = program.getBuildStatus(device);
        var buildOptions = program.getBuildOptions(device);
        var buildLog = program.getBuildLog(device);
        assert.equal(buildStatus, host.cl.defs.BUILD_NONE);
        assert.equal(buildOptions, '');
        assert(_.isString(buildLog));
        program.build('-cl-fast-relaxed-math').then(
            function() {
                buildStatus = program.getBuildStatus(device);
                buildOptions = program.getBuildOptions(device);
                buildLog = program.getBuildLog(device);
                assert.equal(buildStatus, host.cl.defs.BUILD_ERROR);
                assert.equal(buildOptions, '-cl-fast-relaxed-math');
                assert(_.isString(buildLog));
                assert(buildLog.length > 0);
            }).nodeify(done);
    });
});

// helpers
function createContext(host) {
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
}
