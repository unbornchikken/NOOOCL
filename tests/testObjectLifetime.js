"use strict";

/* global describe,it */
var testHelpers = require("./testHelpers");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var CLBuffer = nooocl.CLBuffer;
var assert = require("assert");

describe("NOOOCL", function () {
    it("should call release on gc collect", function () {
        if (!global.gc) {
            console.warn("Please enable GC for unit tests.");
            return;
        }
        var host = CLHost.createV11();
        var context, bufferHandle;
        var createStuff = function () {
            var env = testHelpers.createEnvironment(host, "cpu");
            context = env.context;
            var buffer = new CLBuffer(context, context.cl.defs.CL_MEM_ALLOC_HOST_PTR, 10);
            bufferHandle = buffer.handle;
            assert.equal(2, testHelpers.getContextRefCount(host, context.handle));
            assert.equal(1, testHelpers.getMemRefCount(host, bufferHandle));
        };
        createStuff();
        assert.equal(2, testHelpers.getContextRefCount(host, context.handle));
        assert.equal(1, testHelpers.getMemRefCount(host, bufferHandle));
        global.gc();
        assert.equal(1, testHelpers.getContextRefCount(host, context.handle)); // aka: The buffer has been released for sure.
    });
});
