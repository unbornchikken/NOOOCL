var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');
var CLPlatform = require('./clPlatform');
var CLDevice = require('./clDevice');
var ref = require('ref');

function CLContext() {
    if (arguments[0] instanceof CLPlatform) {
        CLContext2.apply(this, arguments);
    }
    else {
        CLContext1.apply(this, arguments);
    }
}

function CLContext1(devices, properties) {
    var isArray = _.isArray(devices);
    var deviceCount = isArray ? devices.length : 1;
    var firstDevice = isArray ? devices[0] : devices;
    if (!(firstDevice instanceof CLDevice)) {
        throw new TypeError('Arguments unknown.');
    }
    var cl = firstDevice.cl;
    var deviceArray = new (cl.types.DeviceIdArray)(deviceCount);
    if (isArray) {
        for (var i = 0; i < deviceCount; i++) {
            deviceArray[0] = devices[i].handle;
        }
    }
    else {
        deviceArray[0] = devices[0].handle;
    }

    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateContext(null, deviceCount, deviceArray, null, null, err);

    cl.checkError(err);

    CLWrapper.call(this, cl, handle);
}

function CLContext2(platform, deviceType, properties) {
    var cl = platform.cl;

    deviceType = deviceType || cl.defs.DEVICE_TYPE_ALL;

    var propArray = createPropArray(cl, properties, platform);

    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateContextFromType(propArray, deviceType, null, null, err);

    cl.checkError(err);

    CLWrapper.call(this, cl, handle);
}

util.inherits(CLContext, CLWrapper);

Object.defineProperties(CLContext.prototype, {
    _classInfoFunction: {
        get: function () {
            return 'clGetContextInfo';
        }
    }
});

CLContext.prototype.createReleaseMethod = function () {
    var handle = this.handle;
    var cl = this.cl;
    return function () {
        cl.imports.clReleaseContext(handle);
    };
};

CLContext.prototype.createProgram = function (arg1, arg2) {
    return new CLProgram(this, arg1, arg2);
};

CLContext.prototype.supportedImageFormats = function (flags, type) {
    var numFormats = ref.alloc('uint');
    var err = this.cl.imports.clGetSupportedImageFormats(this.handle, flags, type, 0, null, numFormats);

    this.cl.checkError(err);

    var num = numFormats.deref();
    var resultArray = new (this.cl.types.ImageFormatArray)(num);

    err = this.cl.imports.clGetSupportedImageFormats(this.handle, flags, type, num, resultArray, null);

    this.cl.checkError(err);

    var result = [];
    for (var i = 0; i < num; i++) {
        var item = resultArray[i];
        result.push({
            imageChannelOrder: item.imageChannelOrder,
            imageChannelDataType: item.imageChannelDataType
        });
    }
    return result;
};

// Helpers:
function createPropArray(cl, properties, platform) {
    var propCount = _.isArray(properties) ? properties.length : 0;
    var allPropCount = 2 + propCount + 1;
    var propArray = new (cl.types.ContextProperties)(allPropCount);
    propArray[0] = cl.defs.CONTEXT_PLATFORM;
    var ptr = ref.address(platform.handle);
    propArray[1] = ref.address(platform.handle);
    for (var i = 2, c = 0; c < propCount; i++, c++) {
        propArray[i] = properties[c];
    }
    propArray[i] = 0;
    return propArray;
}

module.exports = CLContext;