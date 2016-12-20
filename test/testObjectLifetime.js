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
    before(function () {
        assert(global.gc, 'GC is not enabled.');
    });

    it("should call release on out of scope", function () {
        var relCount = 0;
        var pm = CLWrapper._releaseFunction;
        CLWrapper._releaseFunction = function(func) {
            return function () {
                func();
                relCount++;
            };
        };
        try {
            scope(function () {
                var host = CLHost.createV11();
                var context, buffer;
                var createStuff = function () {
                    var env = testHelpers.createEnvironment(host);
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
            assert.deepEqual(relCount, 2);
        }
        finally {
            CLWrapper._releaseFunction = pm;
        }
    });

    it("should call release on GC", function () {
        var relCount = 0;
        var pm = CLWrapper._releaseFunction;
        CLWrapper._releaseFunction = function(func) {
            return function () {
                func();
                relCount++;
            };
        };
        try {
            var host = CLHost.createV11();
            var context, buffer;
            var env;
            var createStuff = function () {
                env = testHelpers.createEnvironment(host);
                context = env.context;
                buffer = new CLBuffer(context, context.cl.defs.CL_MEM_ALLOC_HOST_PTR, 10);
                assert(testHelpers.getContextRefCount(host, context.handle) > 0);
                assert(testHelpers.getMemRefCount(host, buffer.handle) > 0);
            };
            createStuff();
            assert(testHelpers.getContextRefCount(host, context.handle) > 0);
            assert(testHelpers.getMemRefCount(host, buffer.handle) > 0);
            assert.deepEqual(relCount, 0);
            host = context = buffer = env = null;
            gc();
            assert.deepEqual(relCount, 2);
        }
        finally {
            CLWrapper._releaseFunction = pm;
        }
    });
});
