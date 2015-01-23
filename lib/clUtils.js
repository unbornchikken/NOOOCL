var clUtils = {
    toPtr: function(ptr, name) {
        if (ptr === null) return null;
        if (ptr instanceof Buffer) return ptr;
        if (ptr && ptr.buffer instanceof Buffer) return ptr.buffer;
        throw new TypeError('Pointer "' + (name || 'ptr') + '" is not a buffer.');
    },

    toHandle: function(obj, name) {
        if (obj instanceof Buffer) return obj;
        if (obj && obj.handle instanceof Buffer) return obj.handle;
        throw new TypeError('Object "' + (name || 'obj') + '" is not an OpenCL object.');
    },

    isHandle: function(obj) {
        if (obj instanceof Buffer) return true;
        if (obj && obj.handle instanceof Buffer) return true;
        return false;
    }
};

module.exports = clUtils;
