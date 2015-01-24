var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var CLContext = nooocl.CLContext;
var ref = require('ref');
var ArrayType = require('ref-array');
var CLKernel = nooocl.CLKernel;

var copyMemKernel =
    "kernel void copy(global float* src, global float* dst, uint begin)" +
    "{" +
    "uint idx = get_global_id(0);" +
    "dst[idx] = src[idx + begin];" +
    "}";

describe('CLKernel', function() {
    it('should do NDRange calls', function(done) {
        var i;
        var host = CLHost.createV11();
        var ctx = createContext(host);
        var context = ctx.context;
        var device = ctx.device;
        var FloatArray = new ArrayType('float');
        var srcBuffer = new FloatArray(5);
        var dstBuffer = new FloatArray(3);
        for (i = 0; i < srcBuffer.length; i++) {
            srcBuffer[i] = i * 1.1;
        }
        for (i = 0; i < dstBuffer.length; i++) {
            dstBuffer[i] = 0.0;
        }
        var src = CLBuffer.wrap(context, srcBuffer);
        var dst = CLBuffer.wrap(context, dstBuffer);
        var queue = new CLCommandQueue(context, device);
        var program = context.createProgram(copyMemKernel);
        program.build().then(function() {
            buildStatus = program.getBuildStatus(device);
            if (buildStatus < 0) {
                assert.fail('Build failed.\n' + program.getBuildLog(device));
            }
            var kernel = program.createKernel('copy');
            assert(kernel ? true : false);
            assert(kernel.handle ? true : false);
            assert.equal('copy', kernel.name);
            var kernels = program.createAllKernels();
            assert(_.isArray(kernels));
            assert.equal(1, kernels.length);
            assert.equal(kernel.name, kernels[0].name);
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
