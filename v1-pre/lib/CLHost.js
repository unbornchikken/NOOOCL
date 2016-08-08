'use strict';
const assert = require('assert');
const cl = require('node-opencl');
const CLPlatform = require('./CLPlatform');

class CLHost {
    constructor(minimumVersion) {
        minimumVersion = minimumVersion || 1.0;
        assert(minimumVersion >= 1.0 && minimumVersion < 3.0, 'Invalid: minimumVersion');
        this.minimumVersion = minimumVersion;
        this.cl = cl;
    }
    
    getPlatforms() {
        const result = [];
        for (const id of cl.getPlatformIDs()) {
            const platfrom = new CLPlatform(id);
            if (this.minimumVersion === 1.0 || platfrom.versionNum >= this.minimumVersion) {
                result.push(platfrom);
            }
        }
        return result;
    }
}

module.exports = CLHost;