var assert = require('assert');
var nooocl = require('../');
var CLHost = nooocl.CLHost;
var _ = require('lodash');
var CLBuffer = nooocl.CLBuffer;
var CLCommandQueue = nooocl.CLCommandQueue;
var CLContext = nooocl.CLContext;
var ref = require('ref');
var ArrayType = require('ref-array');

describe('CLBuffer', function () {
    it('can copy contents of two node.js buffer through OpenCL', function (done) {
        try {
            var host = CLHost.createV11();
            var ctx = createContext(host);
            var context = ctx.context;
            var device = ctx.device;
            var srcBuffer = new Buffer(5);
            var queue = new CLCommandQueue(context, device);
            srcBuffer[0] = 11;
            srcBuffer[1] = 12;
            srcBuffer[2] = 13;
            srcBuffer[3] = 14;
            srcBuffer[4] = 15;
            var srcCLBuffer = new CLBuffer(context, host.cl.defs.MEM_COPY_HOST_PTR, srcBuffer.length, srcBuffer);
            var dstCLBuffer = new CLBuffer(context, host.cl.defs.MEM_ALLOC_HOST_PTR, srcBuffer.length, null);
            queue.enqueueCopyBuffer(true, srcCLBuffer, dstCLBuffer, 0, 0, srcBuffer.length).promise
                .then(function () {
                    var destBuffer = new Buffer(srcBuffer.length);
                    destBuffer.fill(0);
                    assert.equal(destBuffer[0], 0);
                    assert.equal(destBuffer[1], 0);
                    assert.equal(destBuffer[2], 0);
                    assert.equal(destBuffer[3], 0);
                    assert.equal(destBuffer[4], 0);
                    return queue.enqueueReadBuffer(true, dstCLBuffer, 0, srcBuffer.length, destBuffer).promise
                        .then(function() {
                            assert.equal(destBuffer[0], 11);
                            assert.equal(destBuffer[1], 12);
                            assert.equal(destBuffer[2], 13);
                            assert.equal(destBuffer[3], 14);
                            assert.equal(destBuffer[4], 15);
                        });
                })
                .nodeify(done);
        }
        catch (e) {
            done(e);
        }
    });

    it('supports sub buffers', function (done) {
        try {
            var host = CLHost.createV11();
            var ctx = createContext(host);
            var context = ctx.context;
            var device = ctx.device;
            var srcBuffer = new Buffer(5);
            var queue = new CLCommandQueue(context, device);
            srcBuffer[0] = 11;
            srcBuffer[1] = 12;
            srcBuffer[2] = 13;
            srcBuffer[3] = 14;
            srcBuffer[4] = 15;
            var srcCLBuffer = new CLBuffer(context, host.cl.defs.MEM_COPY_HOST_PTR, srcBuffer.length, srcBuffer);
            var srcCLSubBuffer = srcCLBuffer.createSubBuffer(0, 1, 3);
            assert.equal(srcCLSubBuffer.size, 3);
            var dstCLBuffer = new CLBuffer(context, host.cl.defs.MEM_ALLOC_HOST_PTR, srcCLSubBuffer.size, null);
            queue.enqueueCopyBuffer(true, srcCLSubBuffer, dstCLBuffer, 0, 0, srcCLSubBuffer.size).promise
                .then(function () {
                    var destBuffer = new Buffer(dstCLBuffer.size);
                    destBuffer.fill(0);
                    assert.equal(destBuffer[0], 0);
                    assert.equal(destBuffer[1], 0);
                    assert.equal(destBuffer[2], 0);
                    return queue.enqueueReadBuffer(true, dstCLBuffer, 0, dstCLBuffer.size, destBuffer).promise
                        .then(function() {
                            assert.equal(destBuffer[0], 12);
                            assert.equal(destBuffer[1], 13);
                            assert.equal(destBuffer[2], 14);
                        });
                })
                .nodeify(done);
        }
        catch (e) {
            done(e);
        }
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
