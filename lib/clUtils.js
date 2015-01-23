var Buffer = require('buffer').Buffer;

var clUtils = {
    toPtr: function(ptr, name) {
        if (ptr === null) return null;
        if (ptr instanceof Buffer) return ptr;
        if (ptr && ptr.buffer instanceof Buffer) return ptr.buffer;
        throw new TypeError('Pointer "' + (name || 'ptr') + '" is not a buffer.');
    },

    toHandle: function(obj) {

    }
};

module.exports = clUtils;
