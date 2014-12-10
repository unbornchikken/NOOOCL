var CLWrapper = require('./clWrapper');
var util = require('util');

function CLPlatform(cl, handle) {
    CLWrapper.call(this, cl, handle);
}

util.inherits(CLPlatform, CLWrapper);

module.exports = CLPlatform;
