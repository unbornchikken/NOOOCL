"use strict";

/* global describe,it */
var assert = require("assert");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var fastcall = require("fastcall");
var ref = fastcall.ref;
var testHelpers = require("./testHelpers");
var scope = nooocl.scope;

describe("CLBuffer", function () {
    beforeEach(function () {
        scope.begin();
    });

    afterEach(function () {
        scope.end();
    });

    it("can copy contents of two node.js buffer through OpenCL", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var srcBuffer = new Buffer(5);
            var queue = new CLCommandQueue(context, device).waitable();
            srcBuffer[0] = 11;
            srcBuffer[1] = 12;
            srcBuffer[2] = 13;
            srcBuffer[3] = 14;
            srcBuffer[4] = 15;
            var srcCLBuffer = new CLBuffer(context, host.cl.defs.CL_MEM_COPY_HOST_PTR, srcBuffer.length, srcBuffer);
            var dstCLBuffer = new CLBuffer(context, host.cl.defs.CL_MEM_ALLOC_HOST_PTR, srcBuffer.length);
            return queue.enqueueCopyBuffer(srcCLBuffer, dstCLBuffer, 0, 0, srcBuffer.length).promise
                .then(function () {
                    var destBuffer = new Buffer(srcBuffer.length);
                    destBuffer.fill(0);
                    assert.equal(destBuffer[0], 0);
                    assert.equal(destBuffer[1], 0);
                    assert.equal(destBuffer[2], 0);
                    assert.equal(destBuffer[3], 0);
                    assert.equal(destBuffer[4], 0);
                    return queue.enqueueReadBuffer(dstCLBuffer, 0, srcBuffer.length, destBuffer).promise
                        .then(function () {
                            assert.equal(destBuffer[0], 11);
                            assert.equal(destBuffer[1], 12);
                            assert.equal(destBuffer[2], 13);
                            assert.equal(destBuffer[3], 14);
                            assert.equal(destBuffer[4], 15);
                        });
                });
        }).nodeify(done);
    });

    it("supports sub buffers", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var srcBuffer = new Buffer(5);
            var queue = new CLCommandQueue(context, device);
            srcBuffer[0] = 11;
            srcBuffer[1] = 12;
            srcBuffer[2] = 13;
            srcBuffer[3] = 14;
            srcBuffer[4] = 15;
            var srcCLBuffer = new CLBuffer(context, host.cl.defs.CL_MEM_COPY_HOST_PTR, srcBuffer.length, srcBuffer);
            var srcCLSubBuffer = srcCLBuffer.createSubBuffer(0, 0, 3);
            assert.equal(srcCLSubBuffer.size, 3);
            var dstCLBuffer = new CLBuffer(context, host.cl.defs.CL_MEM_ALLOC_HOST_PTR, srcCLSubBuffer.size, null);
            queue.enqueueCopyBuffer(srcCLSubBuffer, dstCLBuffer, 0, 0, srcCLSubBuffer.size);
            var destBuffer = new Buffer(dstCLBuffer.size);
            destBuffer.fill(0);
            assert.equal(destBuffer[0], 0);
            assert.equal(destBuffer[1], 0);
            assert.equal(destBuffer[2], 0);
            return queue.waitable().enqueueReadBuffer(dstCLBuffer, 0, dstCLBuffer.size, destBuffer).promise
                .then(function () {
                    assert.equal(destBuffer[0], 11);
                    assert.equal(destBuffer[1], 12);
                    assert.equal(destBuffer[2], 13);
                });
        }).nodeify(done);
    });

    it("supports mapping of host array", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var srcBuffer = new Buffer(5);
            var queue = new CLCommandQueue(context, device).waitable();
            srcBuffer[0] = 11;
            srcBuffer[1] = 12;
            srcBuffer[2] = 13;
            srcBuffer[3] = 14;
            srcBuffer[4] = 15;
            var srcCLBuffer = new CLBuffer(context, host.cl.defs.CL_MEM_USE_HOST_PTR, srcBuffer.length, srcBuffer);
            var out = {};
            return queue.enqueueMapBuffer(srcCLBuffer, host.cl.defs.CL_MAP_READ | host.cl.defs.CL_MAP_WRITE, 1, 3, out).promise
                .then(function () {
                    var buffer = ref.reinterpret(out.ptr, 3, 0);

                    var b = ref.types.byte.get(buffer, 0);
                    assert.equal(12, b);
                    assert.equal(12, buffer[0]);

                    b = ref.types.byte.get(buffer, 1);
                    assert.equal(13, b);
                    assert.equal(13, buffer[1]);

                    b = ref.types.byte.get(buffer, 2);
                    assert.equal(14, b);
                    assert.equal(14, buffer[2]);

                    ref.types.byte.set(buffer, 1, 55);

                    b = ref.types.byte.get(buffer, 1);
                    assert.equal(55, b);
                    assert.equal(55, buffer[1]);

                    return queue.enqueueUnmapMemory(srcCLBuffer, out.ptr).promise
                        .then(function () {
                            assert.equal(11, srcBuffer[0]);
                            assert.equal(12, srcBuffer[1]);
                            assert.equal(55, srcBuffer[2]);
                            assert.equal(14, srcBuffer[3]);
                            assert.equal(15, srcBuffer[4]);
                        });
                });
        }).nodeify(done);
    });
});