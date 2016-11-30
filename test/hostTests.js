"use strict";

/* global describe,it */
var assert = require("assert");
var nooocl = require("../");
var CLHost = nooocl.CLHost;
var _ = require("lodash");
var scope = nooocl.scope;

describe("CLHost", function () {
    beforeEach(function () {
        scope.begin();
    });

    afterEach(function () {
        scope.end();
    });

    it("should return platforms and devices", function () {
        var host = CLHost.createV11();
        assert(_.isObject(host));

        var count = host.platformsCount;
        assert.notEqual(count, 0, "There are no OpenCL platforms found.");

        var platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert.equal(platforms.length, count);

        _.forEach(platforms, function (platform) {
            var info = {
                name: platform.name,
                vendor: platform.vendor,
                clVersion: platform.clVersion,
                profile: platform.profile,
                extensions: platform.extensions
            };

            assert(_.isString(info.name));
            assert.notEqual(info.name.length, 0);
            assert(_.isString(info.vendor));
            assert.notEqual(info.vendor.length, 0);
            assert(_.isString(info.clVersion));
            assert.notEqual(info.clVersion.length, 0);
            assert(_.isString(info.profile));
            assert.notEqual(info.profile.length, 0);
            assert(_.isString(info.extensions));
            assert.notEqual(info.extensions.length, 0);

            var gpuDevices = platform.gpuDevices();
            var cpuDevice = platform.cpuDevices();
            var all = gpuDevices.concat(cpuDevice);
            assert.notEqual(all.length, 0);
            _.forEach(all, function (device) {
                info = {
                    deviceType: device.deviceType,
                    vendorID: device.vendorID,
                    maxComputeUnits: device.maxComputeUnits,
                    maxWorkItemDimensions: device.maxWorkItemDimensions,
                    maxWorkItemSizes: device.maxWorkItemSizes,
                    maxWorkgroupSize: device.maxWorkgroupSize,
                    maxClockFrequency: device.maxClockFrequency,
                    addressBits: device.addressBits,
                    maxMemAllocSize: device.maxMemAllocSize,
                    imageSupport: device.imageSupport,
                    maxReadImageArgs: device.maxReadImageArgs,
                    maxWriteImageArgs: device.maxWriteImageArgs,
                    image2DMaxWidth: device.image2DMaxWidth,
                    image2DMaxHeight: device.image2DMaxHeight,
                    image3DMaxWidth: device.image3DMaxWidth,
                    image3DMaxHeight: device.image3DMaxHeight,
                    image3DMaxDepth: device.image3DMaxDepth,
                    maxSamplers: device.maxSamplers,
                    maxParameterSize: device.maxParameterSize,
                    memBaseAddrAlign: device.memBaseAddrAlign,
                    minDataTypeAlignSize: device.minDataTypeAlignSize,
                    singleFpConfig: device.singleFpConfig,
                    doubleFpConfig: device.doubleFpConfig,
                    globalMemCacheType: device.globalMemCacheType,
                    globalMemCacheLineSize: device.globalMemCacheLineSize,
                    globalMemCacheSize: device.globalMemCacheSize,
                    globalMemSize: device.globalMemSize,
                    maxConstBufferSize: device.maxConstBufferSize,
                    maxConstArgs: device.maxConstArgs,
                    localMemType: device.localMemType,
                    localMemSize: device.localMemSize,
                    errorCorrectionSupport: device.errorCorrectionSupport,
                    hostUnifiedMemory: device.hostUnifiedMemory,
                    profilingTimerResolution: device.profilingTimerResolution,
                    littleEndian: device.littleEndian,
                    available: device.available,
                    compilerAvailable: device.compilerAvailable,
                    DeviceExecCapabilities: device.DeviceExecCapabilities,
                    CommandQueueProperties: device.CommandQueueProperties,
                    name: device.name,
                    vendor: device.vendor,
                    driverVersion: device.driverVersion,
                    profile: device.profile,
                    clVersion: device.clVersion,
                    clCVersion: device.clCVersion,
                    extensions: device.extensions
                };

                assert(info.deviceType === device.cl.defs.CL_DEVICE_TYPE_GPU ||
                    info.deviceType === device.cl.defs.CL_DEVICE_TYPE_CPU);
            });
        });
    });
});