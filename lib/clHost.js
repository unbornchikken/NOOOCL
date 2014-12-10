var clDefs = require('./clDefs');
var _ = require('lodash');
var nodecl = require('nodecl');
var bridjs = require('bridjs');

function CLHost(version) {
    this.version = version;
    switch (version) {
        case clDefs.version.cl_1_1:
        case clDefs.version.cl_1_2:
            this.cl = nodecl.load(version);
            break;
        default :
            throw new Error('Unknown version: ' + version);
    }
}

Object.defineProperties(CLHost, {
    numPlatforms: {
        get: function() {
            var num = new bridjs.NativeValue.uint();
            var err = this.cl.getPlatformIDs(0, null, bridjs.byPointer(num));
            cl.checkError(err);
            return num.get();
        }
    }
});

CLHost.create11 = function() {
    return new CLHost(clDefs.version.cl_1_1);
};

CLHost.create12 = function() {
    return new CLHost(clDefs.version.cl_1_2);
};

module.exports = CLHost;
