var types = require('./types');
var ref = require('ref');

var clPredef = {
    imageFormat: new (types.ImageFormat)(),
    err: ref.alloc(types.ErrorCode)
};

module.exports = clPredef;