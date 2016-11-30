"use strict";

/* global describe,it */
var assert = require("assert");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var _ = require("lodash");
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var fastcall = require("fastcall");
var ref = fastcall.ref;
var ArrayType = fastcall.ArrayType;
var NDRange = nooocl.NDRange;
var testHelpers = require("./testHelpers");
var float = ref.types.float;
var FloatArray = new ArrayType("float");
var scope = nooocl.scope;

var copyMemKernel =
    "kernel void copy(global float* src, global float* dst, uint begin)" +
    "{" +
    "uint idx = get_global_id(0);" +
    "dst[idx - 1] = src[idx + begin];" +
    "}";

describe("CLKernel", function () {
    beforeEach(function () {
        scope.begin();
    });

    afterEach(function () {
        scope.end();
    });

    it("should enqueue NDRange kernels", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var i;
            var srcArray = new FloatArray(5);
            var dstArray = new FloatArray(4);
            for (i = 0; i < srcArray.length; i++) {
                srcArray.set(i, (i + 1) * 1.1);
            }
            for (i = 0; i < dstArray.length; i++) {
                dstArray.set(i, 0.0);
            }
            var src = CLBuffer.wrapReadOnly(context, srcArray);
            var dst = CLBuffer.wrap(context, ref.reinterpret(dstArray.buffer, 3 * float.size, 0));
            assert.equal(srcArray.length * float.size, src.size);
            assert.equal((dstArray.length - 1) * float.size, dst.size);
            var queue = new CLCommandQueue(context, device);
            var program = context.createProgram(copyMemKernel);
            return program.build().then(function () {
                var buildStatus = program.getBuildStatus(device);
                if (buildStatus < 0) {
                    assert.fail("Build failed.\n" + program.getBuildLog(device));
                }
                var kernel = program.createKernel("copy");
                assert(kernel ? true : false);
                assert(kernel.handle ? true : false);
                assert.equal("copy", kernel.name);
                var kernels = program.createAllKernels();
                assert(_.isArray(kernels));
                assert.equal(kernels.length, 1);
                assert.equal(kernel.name, kernels[0].name);

                var assertValues = function () {
                    var out = {};
                    return queue.waitable().enqueueMapBuffer(dst, host.cl.defs.CL_MAP_READ | host.cl.defs.CL_MAP_WRITE, 0, dst.size, out).promise
                        .then(function () {
                            var buffer = ref.reinterpret(out.ptr, dst.size + float.size, 0);
                            var v1 = float.get(buffer, 0).toFixed(2);
                            var v2 = dstArray.get(0).toFixed(2);
                            assert.equal(v1, v2);
                            assert.equal(v1, srcArray.get(2).toFixed(2));
                            float.set(buffer, 0, 0.0);

                            v1 = float.get(buffer, 1 * float.size).toFixed(2);
                            v2 = dstArray.get(1).toFixed(2);
                            assert.equal(v1, v2);
                            assert.equal(v1, srcArray.get(3).toFixed(2));
                            float.set(buffer, 1 * float.size, 0.0);

                            v1 = float.get(buffer, 2 * float.size).toFixed(2);
                            v2 = dstArray.get(2).toFixed(2);
                            assert.equal(v1, v2);
                            assert.equal(v1, srcArray.get(4).toFixed(2));
                            float.set(buffer, 2 * float.size, 0.0);

                            v1 = float.get(buffer, 3 * float.size).toFixed(2);
                            v2 = dstArray.get(3).toFixed(2);
                            assert.equal(v1, v2);
                            assert.equal(v1, 0.0);

                            return queue.waitable().enqueueUnmapMemory(dst, out.ptr).promise;
                        });
                };

                // Test bind:
                var func = kernel.bind(queue, new NDRange(3), null, new NDRange(1));
                func(src, dst, { "uint": 1 });

                return assertValues()
                    .then(function () {
                        // Test direct call:
                        kernels[0].setArg(0, src);
                        kernels[0].setArg(1, dst);
                        kernels[0].setArg(2, 1, "uint");
                        queue.enqueueNDRangeKernel(kernels[0], new NDRange(3), null, new NDRange(1));

                        return assertValues();
                    });
            });
        }).nodeify(done);
    });
});