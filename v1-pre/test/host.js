'use strict';
const nooocl = require('../lib');
const CLHost = nooocl.CLHost;
const assert = require('assert');
const _ = require('lodash');

describe("CLHost", function () {
    it("should return platforms and devices", function () {
        const host = new CLHost();
        assert(_.isObject(host));

        const platforms = host.getPlatforms();
        assert(_.isArray(platforms));
        assert(platforms.length > 0);

        for (const platform of platforms) {
            let info = {
                name: platform.name,
                vendor: platform.vendor,
                version: platform.version,
                versionNum: platform.versionNum,
                profile: platform.profile,
                extensions: platform.extensions
            };

            assert(_.isString(info.name));
            assert.notEqual(info.name.length, 0);
            assert(_.isString(info.vendor));
            assert.notEqual(info.vendor.length, 0);
            assert(_.isString(info.version));
            assert.notEqual(info.version.length, 0);
            assert(info.versionNum >= 1.0);
            assert(_.isString(info.profile));
            assert.notEqual(info.profile.length, 0);
            assert(_.isString(info.extensions));
            assert.notEqual(info.extensions.length, 0);

            const gpuDevices = platform.getGPUDevices();
            const cpuDevice = platform.getCPUDevices();
            const all = gpuDevices.concat(cpuDevice);
            const devices = platform.getDevices();
            assert.notEqual(all.length, 0);
            assert.notEqual(devices.length, 0);
            assert(devices.length >= all.length);
            for (const device of all) {
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
                    deviceExecCapabilities: device.deviceExecCapabilities,
                    commandQueueProperties: device.commandQueueProperties,
                    name: device.name,
                    vendor: device.vendor,
                    driverVersion: device.driverVersion,
                    profile: device.profile,
                    version: device.version,
                    versionNum: device.versionNum,
                    openCLCVersion: device.openCLCVersion,
                    openCLCVersionNum: device.openCLCVersionNum,
                    extensions: device.extensions
                };

                _.each(info, function (value, key) {
                    assert(value !== undefined, 'Platform info undefined: ' + key);
                });

                assert(info.deviceType === host.cl.DEVICE_TYPE_GPU ||
                    info.deviceType === host.cl.DEVICE_TYPE_CPU);

                console.log(info);
            }
        }
    });
});