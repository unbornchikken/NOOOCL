'use strict';
const assert = require('assert');
const CLMemory = require('./CLMemory');

const wrapMode = {
    readWrite: 0,
    readOnly: 1,
    writeOnly: 2
};

class CLBuffer extends CLMemory {
    constructor(options) {
        assert(_.isObject(options), 'Object argument expected.');
        assert(_.isObject(options.context), '"options.context" expected.');

        if (options.handle) {
            super(options.handle, options.context);
            return;
        }
        
        let dataSize = options.dataSize;
        if (options.data && !dataSize) {
            dataSize = options.data.length;
        }

        if (dataSize) {
            const handle = this.cl.createBuffer(options.context, options.flags || 0, dataSize, options.data || null);
            super(handle, options.context);
        }
        else {
            assert(false, 'Invalid options.');
        }
    }

    static wrap(context, data) {
        return _wrap(context, data);
    }

    static wrapReadOnly(context, data) {
        return _wrap(context, data, wrapMode.readOnly);
    }

    static wrapWriteOnly(context, data) {
        return _wrap(context, data, wrapMode.writeOnly);
    }

    static _wrap(context, data, mode) {
        let flags = this.cl.MEM_USE_HOST_PTR;
        if (mode === wrapMode.readOnly) {
            flags |= this.cl.MEM_READ_ONLY;
        }
        else if (readOrWriteOnly === wrapMode.writeOnly) {
            flags |= this.cl.MEM_WRITE_ONLY;
        }
        return new CLBuffer({
            context: context,
            flags: flags,
            data: data
        });
    }

    get offset() {
        return this.getInfo(this.cl.MEM_OFFSET);
    }

    getAssociatedBuffer() {
        const handle = this.getInfo(this.cl.MEM_ASSOCIATED_MEMOBJECT);

        if (!handle) {
            return null;
        }

        return new CLBuffer({
            handle: handle,
            context: this.context
        });
    }

    createSubBuffer(options) {
        assert(_.isObject(options), 'Object argument expected.');
        assert(options.origin >= 0, '"options.origin" invlaid.');
        assert(options.size > 0, '"options.size" invalid.');

        return new CLBuffer({
            context: this.context,
            handle: this.cl.createSubBuffer(
                this.handle,
                options.flags || 0,
                this.cl.BUFFER_CREATE_TYPE_REGION,
                options)
        });
    }
}

module.exports = CLBuffer;