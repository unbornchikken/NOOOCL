"use strict";

/* global describe,it */
var assert = require("assert");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var _ = require("lodash");
var testHelpers = require("./testHelpers");
var scope = nooocl.scope;

var source = "kernel void foo(global float* data) { }";

var badSource = "da shit";

describe("CLContext", function () {
    beforeEach(function () {
        scope.begin();
    });

    afterEach(function () {
        scope.end();
    });

    it("should build and get kernel from string source", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var program = context.createProgram(source);
            var buildStatus = program.getBuildStatus(device);
            var buildOptions = program.getBuildOptions(device);
            var buildLog = program.getBuildLog(device);
            assert.equal(buildStatus, host.cl.defs.CL_BUILD_NONE);
            assert.equal(buildOptions, "");
            assert(_.isString(buildLog));
            return program.build("-cl-fast-relaxed-math").then(
                function () {
                    buildStatus = program.getBuildStatus(device);
                    buildOptions = program.getBuildOptions(device);
                    buildLog = program.getBuildLog(device);
                    assert.equal(buildStatus, host.cl.defs.CL_BUILD_SUCCESS);
                    assert.equal(buildOptions, "-cl-fast-relaxed-math");
                    assert(_.isString(buildLog));
                    var binaries = program.getBinaries();
                    assert(_.isArray(binaries));
                    assert.equal(binaries.length, 1);
                    assert(binaries[0] instanceof Buffer);
                    assert(binaries[0].length > 0);
                });
        }).nodeify(done);
    });

    it("should fail by building a fucked up string source", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var program = context.createProgram(badSource);
            var buildStatus = program.getBuildStatus(device);
            var buildOptions = program.getBuildOptions(device);
            var buildLog = program.getBuildLog(device);
            assert.equal(buildStatus, host.cl.defs.CL_BUILD_NONE);
            assert.equal(buildOptions, "");
            assert(_.isString(buildLog));
            return program.build("-cl-fast-relaxed-math").then(
                function () {
                    buildStatus = program.getBuildStatus(device);
                    buildOptions = program.getBuildOptions(device);
                    buildLog = program.getBuildLog(device);
                    assert.equal(buildStatus, host.cl.defs.CL_BUILD_ERROR);
                    assert.equal(buildOptions, "-cl-fast-relaxed-math");
                    assert(_.isString(buildLog));
                    assert(buildLog.length > 0);
                    var buildLogs = program.getBuildLogs();
                    assert(_.isString(buildLogs));
                    assert.equal(buildLogs, buildLog);
                });
        }).nodeify(done);
    });

    it("should support binaries", function (done) {
        testHelpers.doTest(function (env) {
            var host = env.host;
            var context = env.context;
            var device = env.device;
            var program = context.createProgram(source);
            var buildStatus = program.getBuildStatus(device);
            var buildOptions = program.getBuildOptions(device);
            var buildLog = program.getBuildLog(device);
            assert.equal(buildStatus, host.cl.defs.CL_BUILD_NONE);
            assert.equal(buildOptions, "");
            assert(_.isString(buildLog));
            return program.build("-cl-fast-relaxed-math").then(
                function () {
                    var binaries = program.getBinaries();
                    assert(_.isArray(binaries));
                    assert.equal(binaries.length, 1);
                    assert(binaries[0] instanceof Buffer);
                    assert(binaries[0].length > 0);

                    var program2 = context.createProgram(binaries, device);
                    return program2.build("-cl-fast-relaxed-math").then(
                        function () {
                            buildStatus = program2.getBuildStatus(device);
                            assert.equal(buildStatus, host.cl.defs.CL_BUILD_SUCCESS);
                        });
                });
        }).nodeify(done);
    });
});
