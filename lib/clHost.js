var _ = require('lodash');
var Type = nodecl.Type;
var CLPlatform = require('./clPlatform');

function CLHost(version) {
    this.version = version;
    switch (version) {
        case CLHost.supportedVersions.cl11:
            this.cl = nodecl.load(1.1);
            break;
        case CLHost.supportedVersions.cl11:
            this.cl = nodecl.load(1.2);
            break;
        default :
            throw new Error('Unknown version: ' + version);
    }
    this.cl.version = version;
    this.cl.types = clDefs.types;
}

CLHost.supportedVersions = {
    cl11: 1.1,
    cl12: 1.2
};

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
    nodecl.checkError(err);
    var platforms = [];
    for (var i = 0; i < nCount; i++) {
        platforms.push(new CLPlatform(this.cl, plaformIds.get(i)));
    }
    return platforms;
};

module.exports = CLHost;
