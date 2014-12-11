var clDefs = require('./clDefs');
var _ = require('lodash');
var nodecl = require('nodecl');
var bridjs = require('bridjs');

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

Object.defineProperties(CLHost.prototype, {
    platformsCount: {
        get: function() {
            var num = new bridjs.NativeValue.uint();
            var err = this.cl.getPlatformIDs(0, null, bridjs.byPointer(num));
            nodecl.checkError(err);
            return num.get();
        }
    }
});

CLHost.createV11 = function() {
    return new CLHost(clDefs.version.cl_1_1);
};

CLHost.createV12 = function() {
    return new CLHost(clDefs.version.cl_1_2);
};

module.exports = CLHost;
