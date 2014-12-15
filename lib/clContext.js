var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');

function CLContext() {
    throw new Error('TODO: Detect arguments.');
}

function CLContext1(devices, properties) {
    var isArray = _.isArray(devices);
    var deviceCount = isArray ? devices.length : 1;
    var firstDevice = isArray ? devices[0] : devices;
    var cl = firstDevice.cl;
    var deviceArray = bridjs.newArray(nodecl.Type.deviceId, deviceCount);
    if (isArray) {
        for (var i = 0; i < deviceCount; i++) {
            deviceArray.set(0, devices[i].handle);
        }
    }
    else {
        deviceArray.set(0, devices[0].handle);
    }

    var propArray = createPropArray(properties, firstDevice.platform);

    var err = bridjs.newNativeValue(nodecl.Type.errcode);
    var handle = cl.createContext(bridjs.byPointer(propArray), deviceCount, bridjs.byPointer(deviceArray), null, null, bridjs.byPointer(err));

    nodecl.checkError(err);

    CLWrapper.call(this, cl, handle);
}

function CLContext2(platform, deviceType, properties) {
    var cl = platform.cl;

    deviceType = deviceType || cl.DEVICE_TYPE_ALL;

    var propArray = createPropArray(properties, platform);

    var err = bridjs.newNativeValue(nodecl.Type.errcode);
    var handle = cl.createContext(bridjs.byPointer(propArray), deviceType, null, null, bridjs.byPointer(err));

    nodecl.checkError(err);

    CLWrapper.call(this, cl, handle);
}

util.inherits(CLContext, CLWrapper);

CLContext.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.releaseContext(handle);
    };
};

CLContext.prototype.createProgram = function (arg1, arg2) {
    return new CLProgram(this, arg1, arg2);
};

CLContext.prototype.supportedImageFormats = function (flags, type) {
    var numFormats = new bridjs.NativeValue.uint();
    var err = this.cl.getSupportedImageFormats(this.handle, flags, type, 0, null, bridjs.byPointer(numFormats));

    nodecl.checkError(err);

    var num = numFormats.get();
    var resultArray = bridjs.newArray(nodecl.Type.ImageFormat, num);

    err = this.cl.getSupportedImageFormats(this.handle, flags, type, num, bridjs.byPointer(resultArray), null);

    nodecl.checkError(err);

    var result = [];
    for (var i = 0; i < num; i++) {
        var item = resultArray.get(i);
        result.push({
            imageChannelOrder: item.imageChannelOrder.get(),
            imageChannelDataType: item.imageChannelDataType.get()
        });
    }
    return result;
};

// Helpers:
function createPropArray(properties, platform) {
    var propCount = _.isArray(properties) ? properties.length : 0;
    var allPropCount = 2 + propCount + 1;
    var propArray = bridjs.newArray(nodecl.Type.contextProperties, allPropCount);
    propArray.set(0, this.cl.CONTEXT_PLATFORM);
    propArray.set(1, platform.handle);
    for (var i = 2, c = 0; c < propCount; i++, c++) {
        propArray.set(i, properties[c]);
    }
    propArray.set(i, 0);
}

module.exports = CLContext;