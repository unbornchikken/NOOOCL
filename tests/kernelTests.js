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
var NDRange = nooocl.NDRange;
var Promise = require('bluebird');
var testHelpers = require('./testHelpers');

var copyMemKernel =
    "kernel void copy(global float* src, global float* dst, uint begin)" +
    "{" +
    "uint idx = get_global_id(0);" +
    "dst[idx - 1] = src[idx + begin];" +
    "}";

describe('CLKernel', function() {
    it('should do NDRange calls', function(done) {
        var i;
        var host = CLHost.createV11();
        var ctx = testHelpers.createContext(host);
        var context = ctx.context;
        var device = ctx.device;
        var FloatArray = new ArrayType('float');
        var srcArray = new FloatArray(5);
        var dstArray = new FloatArray(3);
        for (i = 0; i < srcArray.length; i++) {
            srcArray[i] = (i + 1) * 1.1;
        }
        for (i = 0; i < dstArray.length; i++) {
            dstArray[i] = 0.0;
        }
        var src = CLBuffer.wrap(context, srcArray);
        var dst = CLBuffer.wrap(context, dstArray);
        assert.equal(srcArray.length * ref.types.float.size, src.size);
        assert.equal(dstArray.length * ref.types.float.size, dst.size);
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

            var assertValues = function() {
                var out = {};
                return queue.waitable().enqueueMapBuffer(dst, host.cl.defs.CL_MAP_READ | host.cl.defs.CL_MAP_WRITE, 0, dst.size, out).promise
                    .then(function () {
                        var buffer = ref.reinterpret(out.ptr, dst.size, 0);
                        var v1 = ref.types.float.get(buffer, 0).toFixed(2);
                        var v2 = dstArray[0].toFixed(2);
                        assert.equal(v1, v2);
                        assert.equal(v1, 3.3);
                        dstArray[0] = 0.0;

                        v1 = ref.types.float.get(buffer, 1 * ref.types.float.size).toFixed(2);
                        v2 = dstArray[1].toFixed(2);
                        assert.equal(v1, v2);
                        assert.equal(v1, 4.4);
                        dstArray[1] = 0.0;

                        v1 = ref.types.float.get(buffer, 2 * ref.types.float.size).toFixed(2);
                        v2 = dstArray[2].toFixed(2);
                        assert.equal(v1, v2);
                        assert.equal(v1, 5.5);
                        dstArray[2] = 0.0;

                        queue.enqueueUnmapMemory(dst, out.ptr);
                    });
            };

            // Test bind:
            var func = kernel.bind(queue, new NDRange(3), null, new NDRange(1));
            func(src, dst, { 'uint': 1 });

            return assertValues()
                .then(function() {
                    // Test direct call:
                    kernels[0].setArg(0, src);
                    kernels[0].setArg(1, dst);
                    kernels[0].setArg(2, 1, 'uint');
                    queue.enqueueNDRangeKernel(kernels[0],new NDRange(3), null, new NDRange(1));

                    return assertValues();
                });
        }).nodeify(done);
    });
});