'use strict';
const CLWrapper = require('./CLWrapper');

class CLMemory extends CLWrapper {
    constructor(handle, context) {
        super(handle);
        this.context = context;
    }

    classInfoFunction() {
        return this.cl.getMemObjectInfo;
    }

    get mapCount() {
        return this.getInfo(this.cl.MEM_MAP_COUNT);
    }

    get hostPtr() {
        throw new Error('TODO: Make a ref compatible PR for supporting hostPtr at node-opencl side.');
        //return this.getInfo(this.cl.MEM_HOST_PTR);
    }

    get size() {
        return this.getInfo(this.cl.MEM_SIZE);
    }

    get memFlags() {
        return this.getInfo(this.cl.MEM_FLAGS);
    }

    createReleaseMethod() {
        const handle = this.handle;
        const cl = this.cl;
        return () => cl.imports.clReleaseMemObject(handle);
    }

    setDestructorCallback() {
        throw new Error('TODO: Make a PR for supporting setDestructorCallback at node-opencl side.');
    }
}

module.exports = CLMemory;