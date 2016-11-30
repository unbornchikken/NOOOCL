"use strict";

/* global describe,it */
var testHelpers = require("./testHelpers");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var CLBuffer = nooocl.CLBuffer;
var CLWrapper = require("../lib/clWrapper");
var assert = require("assert");
var scope = require('fastcall').scope;

describe("NOOOCL", function () {
    it("should call release on out of scope", function () {
        var relCount = 0;
        var pm = CLWrapper.prototype.release;
        CLWrapper.prototype.release = function() {
            pm.call(this);
            relCount++;
        };
        try {
            scope(function () {
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
                assert.deepEqual(relCount, 0);
            });
            assert.deepEqual(relCount, 5);
        }
        finally {
            CLBuffer.prototype.createReleaseMethod = pm;
        }
    });
});
