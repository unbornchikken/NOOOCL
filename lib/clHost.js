var clDefs = require('./clDefs');
var _ = require('lodash');
var nodecl = require('nodecl');
var bridjs = require('bridjs');
var Type = nodecl.Type;
var CLPlatform = require('./clPlatform');

function CLHost(version) {
    this.version = version;
    switch (version) {
        case clDefs.version.cl_1_1:
            this.cl = nodecl.load(1.1);
            this.cl.version = version;
            break;
        case clDefs.version.cl_1_2:
            this.cl = nodecl.load(1.2);
            this.cl.version = version;
            break;
        default :
            throw new Error('Unknown version: ' + version);
    }
}

CLHost.createV11 = function() {
    return new CLHost(clDefs.version.cl_1_1);
};

CLHost.createV12 = function() {
    return new CLHost(clDefs.version.cl_1_2);
};

Object.defineProperties(CLHost.prototype, {
    _nPlatformsCount: {
        get: function() {
            var num = new bridjs.NativeValue.uint();
            var err = this.cl.getPlatformIDs(0, null, bridjs.byPointer(num));
            nodecl.checkError(err);
            return num;
        }
    },
    platformsCount: {
        get: function() {
            return this._nPlatformsCount.get();
        }
    }
});

CLHost.prototype.getPlatforms = function() {
    var count = this._nPlatformsCount;
    var nCount = count.get();
    var plaformIds = bridjs.newArray(Type.platformId, nCount);
    var err = this.cl.getPlatformIDs(plaformIds.length, bridjs.byPointer(plaformIds), bridjs.byPointer(count));
    var platforms = [];
    for (var i = 0; i < nCount; i++) {
        platforms.push(new CLPlatform(this.cl, plaformIds.get(i)));
    }
    return platforms;
};

module.exports = CLHost;
