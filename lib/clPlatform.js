var CLWrapper = require('./clWrapper');
var util = require('util');

function CLPlatform(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLPlatform, CLWrapper);

Object.defineProperties(CLPlatform.prototype, {
    _classInfoFunction: {
        value: 'getPlatformInfo'
    },
    name: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_NAME);
        }
    },
    vendor: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_VENDOR);
        }
    },
    clVersion: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_VERSION);
        }
    },
    profile: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_PROFILE);
        }
    },
    extensions: {
        get: function() {
            return this._getStringInfo(this.cl.PLATFORM_EXTENSIONS);
        }
    }
});

CLPlatform.prototype.createReleaseMethod = function() { return null; };

module.exports = CLPlatform;
