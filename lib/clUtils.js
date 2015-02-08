'use strict';
var _ = require('lodash');
var types = require('./types');
var clPredef = require('./clPredef');

var clUtils = {
    toPtr: function (ptr, name) {
        if (ptr === null) {
            return null;
        }
        if (ptr instanceof Buffer) {
            return ptr;
        }
        if (ptr && ptr.buffer instanceof Buffer) {
            return ptr.buffer;
        }
        throw new TypeError('Pointer "' + (name || 'ptr') + '" is not a buffer.');
    },

    toHandle: function (obj, name) {
        if (obj instanceof Buffer) {
            return obj;
        }
        if (obj && obj.handle instanceof Buffer) {
            return obj.handle;
        }
        throw new TypeError('Object "' + (name || 'obj') + '" is not an OpenCL object.');
    },

    isHandle: function (obj) {
        if (obj instanceof Buffer) {
            return true;
        }
        if (obj && obj.handle instanceof Buffer) {
            return true;
        }
        return false;
    },

    createDeviceArray: function (devices) {
        var i;
        if (!_.isArray(devices)) {
            devices = [devices];
        }
        var deviceArray = new (types.DeviceIdArray)(devices.length);
        for (i = 0; i < devices.length; i++) {
            deviceArray[i] = devices[i].handle;
        }
        return deviceArray;
    },

    asImageFormat: function(format) {
        if (!format.constructor || format.constructor.name !== 'StructType') {
            var format2 = clPredef.imageFormat;
            format2.imageChannelOrder = format.imageChannelOrder;
            format2.imageChannelDataType = format.imageChannelDataType;
            format = format2;
        }
        return format;
    }
};

module.exports = clUtils;
