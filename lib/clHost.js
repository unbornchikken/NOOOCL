var _ = require('lodash');
var cl = require('./cl');
var CLPlatform = require('./clPlatform');
var ref = require('ref');

function CLHost(version) {
    this.version = version;
    switch (version) {
        case CLHost.supportedVersions.cl11:
            this.cl = new (cl.CL11)();
            break;
        case CLHost.supportedVersions.cl12:
            this.cl = new (cl.CL12)();
            break;
        default :
            throw new Error('Unknown version: ' + version);
    }
}

CLHost.supportedVersions = {
    cl11: 1.1,
    cl12: 1.2
};

CLHost.createV11 = function() {
    return new CLHost(CLHost.supportedVersions.cl11);
};

CLHost.createV12 = function() {
    return new CLHost(CLHost.supportedVersions.cl12);
};

Object.defineProperties(CLHost.prototype, {
    _nPlatformsCount: {
        get: function() {
            var num = ref.alloc('uint');
            var err = this.cl.imports.clGetPlatformIDs(0, null, num);
            this.cl.checkError(err);
            return num;
        }
    },
    platformsCount: {
        get: function() {
            return this._nPlatformsCount.deref();
        }
    }
});

CLHost.prototype.getPlatforms = function() {
    var count = this._nPlatformsCount;
    var nCount = count.deref();
    var plaformIds = new (this.cl.types.PlatformIdArray)(nCount);
    var err = this.cl.imports.clGetPlatformIDs(plaformIds.length, plaformIds, count);
    this.cl.checkError(err);
    var platforms = [];
    for (var i = 0; i < nCount; i++) {
        platforms.push(new CLPlatform(this.cl, plaformIds[i]));
    }
    return platforms;
};

module.exports = CLHost;
