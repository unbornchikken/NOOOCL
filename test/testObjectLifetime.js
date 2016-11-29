"use strict";

/* global describe,it */
var testHelpers = require("./testHelpers");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var CLBuffer = nooocl.CLBuffer;
var assert = require("assert");

describe("NOOOCL", function () {
    it("should call release on gc collect", function (done) {
        if (!global.gc) {
            console.warn("Please enable GC for unit tests.");
            return;
        }
        var released = false;
        var pm = CLBuffer.prototype.createReleaseMethod;
        CLBuffer.prototype.createReleaseMethod = function() {
            var m = pm.call(this);
            return function () {
                released = true;
                m();
            }
        };
        var host = CLHost.createV11();
        var context, buffer;
        var createStuff = function () {
            var env = testHelpers.createEnvironment(host, "gpu");
            context = env.context;
            buffer = new CLBuffer(context, context.cl.defs.CL_MEM_ALLOC_HOST_PTR, 10);
            assert(testHelpers.getContextRefCount(host, context.handle) > 0);
            assert(testHelpers.getMemRefCount(host, buffer.handle) > 0);
        };
        createStuff();
        assert(testHelpers.getContextRefCount(host, context.handle) > 0);
        assert(testHelpers.getMemRefCount(host, buffer.handle) > 0);
        assert.deepEqual(released, false);
        buffer = null;
        global.gc();
        process.nextTick(function() {
            assert(testHelpers.getContextRefCount(host, context.handle) > 0);
            assert.deepEqual(released, true);
            CLBuffer.prototype.createReleaseMethod = pm;
            done();
        });
    });
});
