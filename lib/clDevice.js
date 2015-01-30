var CLWrapper = require('./clWrapper');
var util = require('util');
var _ = require('lodash');

function CLDevice(cl, handle, platform) {
    CLWrapper.call(this, cl, handle);
    this.platform = platform;
}

util.inherits(CLDevice, CLWrapper);

Object.defineProperties(CLDevice.prototype, {
    _classInfoFunction: {
        value: 'clGetDeviceInfo'
    },
    DeviceType: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.DeviceType, this.cl.defs.CL_DEVICE_TYPE);
        }
    },

    //! A unique device vendor identifier. (e.g. PCIe ID)
    vendorID: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_VENDOR_ID);
        }
    },

    //! The number of parallel compute cores on the OpenCL device (min. 1)
    maxComputeUnits: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_VENDOR_ID);
        }
    },

    /**
     *    Maximum dimensions that specify the global and local work-item IDs used by
     *    the data parallel execution model. (Refer to clEnqueueNDRangeKernel)
     *    The minimum value is 3.
     */
    maxWorkItemDimensions: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS);
        }
    },

    /**
     *    Maximum number of work-items that can be specified in each dimension of
     *    the work-group to clEnqueueNDRangeKernel.
     *
     *    The minimum value is (1, 1, 1).
     *
     *    Returns:
     *        n size_t entries, where n is the value returned by the query for maxWorkItemDimensions.
     */
    maxWorkItemSizes: {
        get: function () {
            this._throwIfReleased();
            return this._getArrayInfo('size_t', this.cl.defs.CL_DEVICE_MAX_WORK_ITEM_SIZES);
        }
    },

    /**
     *    Maximum number of work-items in a work-group executing a kernel using the data parallel execution model.
     * (Refer to clEnqueueNDRangeKernel). The minimum value is 1.
     */
    maxWorkgroupSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_MAX_WORK_GROUP_SIZE);
        }
    },

    //! Maximum configured clock frequency of the device in MHz
    maxClockFrequency: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MAX_CLOCK_FREQUENCY);
        }
    },

    /**
     *    The default compute device address space size specified as an unsigned integer value in bits.
     *    Currently supported values are 32 or 64 bits
     */
    addressBits: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_ADDRESS_BITS);
        }
    },

    /**
     *    Max size of memory object allocation in bytes.
     *    The minimum value is max(1/4 * CL_DEVICE_GLOBAL_MEM_SIZE, 128*1024*1024)
     */
    maxMemAllocSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint64', this.cl.defs.CL_DEVICE_MAX_MEM_ALLOC_SIZE);
        }
    },

    //! true if images are supported by the OpenCL device
    imageSupport: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.Bool, this.cl.defs.CL_DEVICE_IMAGE_SUPPORT);
        }
    },

    /**
     *    Max number of simultaneous image objects that can be read by a kernel.
     *    minimum value is 128 if imageSupport is true
     */
    maxReadImageArgs: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MAX_READ_IMAGE_ARGS);
        }
    },

    /**
     *    Max number of simultaneous image objects that can be written by a kernel.
     *    minimum value is 8 if imageSupport is true
     */
    maxWriteImageArgs: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MAX_WRITE_IMAGE_ARGS);
        }
    },

    /**
     *    Max width of 2D image in pixels.
     *    minimum value is 8192 if imageSupport is true
     */
    image2DMaxWidth: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_IMAGE2D_MAX_WIDTH);
        }
    },

    /**
     *    Max height of 2D image in pixels.
     *    minimum value is 8192 if imageSupport is true
     */
    image2DMaxHeight: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_IMAGE2D_MAX_HEIGHT);
        }
    },

    /**
     *    Max width of 3D image in pixels.
     *    minimum value is 2048 if imageSupport is true
     */
    image3DMaxWidth: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_IMAGE3D_MAX_WIDTH);
        }
    },

    /**
     *    Max height of 3D image in pixels.
     *    minimum value is 2048 if imageSupport is true
     */
    image3DMaxHeight: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_IMAGE3D_MAX_HEIGHT);
        }
    },

    /**
     *    Max depth of 3D image in pixels.
     *    minimum value is 2048 if imageSupport is true
     */
    image3DMaxDepth: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_IMAGE3D_MAX_DEPTH);
        }
    },

    /**
     *    Maximum number of samplers that can be used in a kernel.
     *    minimum value is 16 if imageSupport is true
     */
    maxSamplers: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MAX_SAMPLERS);
        }
    },

    /**
     *    Max size in bytes of the arguments that can be passed to a kernel.
     *
     *    The minimum value is 1024. For this minimum value, only a maximum of
     *    128 arguments can be passed to a kernel
     */
    maxParameterSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_MAX_PARAMETER_SIZE);
        }
    },

    /**
     *    The minimum value is the size (in bits) of the largest OpenCL built-in data
     *    type supported by the device (long16 in FULL profile, long16 or int16 in EMBEDDED profile).
     */
    memBaseAddrAlign: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MEM_BASE_ADDR_ALIGN);
        }
    },

    /**
     *    The minimum value is the size (in bytes) of the largest OpenCL builtin
     *    data type supported by the device (long16 in FULL profile, long16 or int16 in EMBEDDED profile).
     */
    minDataTypeAlignSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE);
        }
    },

    //! Describes single precision floating-point capability of the device. This is a bit-field, see the docs
    singleFpConfig: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.DeviceFpConfig, this.cl.defs.CL_DEVICE_SINGLE_FP_CONFIG);
        }
    },

    //! Describes double precision floating-point capability of the device. Make sure the cl_khr_fp64 extension is supported
    doubleFpConfig: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.DeviceFpConfig, this.cl.defs.CL_DEVICE_DOUBLE_FP_CONFIG);
        }
    },

    /**
     *    Type of global memory cache supported. Valid values are:
     *    CL_NONE, CL_READ_ONLY_CACHE and CL_READ_WRITE_CACHE
     */
    globalMemCacheType: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.DeviceMemCacheType, this.cl.defs.CL_DEVICE_GLOBAL_MEM_CACHE_TYPE);
        }
    },

    //! size of global memory cache line in bytes.
    globalMemCacheLineSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE);
        }
    },

    //! size of global memory cache in bytes.
    globalMemCacheSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint64', this.cl.defs.CL_DEVICE_GLOBAL_MEM_CACHE_SIZE);
        }
    },

    //! size of global device memory in bytes.
    globalMemSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint64', this.cl.defs.CL_DEVICE_GLOBAL_MEM_SIZE);
        }
    },

    //! Max size in bytes of a constant buffer allocation (min. 64 KB)
    maxConstBufferSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint64', this.cl.defs.CL_DEVICE_MAX_CONSTANT_BUFFER_SIZE);
        }
    },

    //! Max number of arguments declared with the __constant qualifier in a kernel (min. 8)
    maxConstArgs: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint', this.cl.defs.CL_DEVICE_MAX_CONSTANT_ARGS);
        }
    },

    /**
     *    Type of local memory supported.
     *    This can be set to CL_LOCAL implying dedicated local memory storage such as SRAM, or CL_GLOBAL
     */
    localMemType: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.DeviceLocalMemType, this.cl.defs.CL_DEVICE_LOCAL_MEM_TYPE);
        }
    },

    //! Size of local memory arena in bytes. The minimum value is 32 KB.
    localMemSize: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('uint64', this.cl.defs.CL_DEVICE_LOCAL_MEM_SIZE);
        }
    },

    //! true if the device implements error correction for all accesses to compute device memory (global and constant)
    errorCorrectionSupport: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.Bool, this.cl.defs.CL_DEVICE_ERROR_CORRECTION_SUPPORT);
        }
    },

    //! returns true if the device and the host have a unified memory subsystem
    hostUnifiedMemory: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.Bool, this.cl.defs.CL_DEVICE_HOST_UNIFIED_MEMORY);
        }
    },

    /**
     *    Describes the resolution of device timer.
     *    This is measured in nanoseconds.
     */
    profilingTimerResolution: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo('size_t', this.cl.defs.CL_DEVICE_PROFILING_TIMER_RESOLUTION);
        }
    },

    //! is device a little endian device?
    littleEndian: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.Bool, this.cl.defs.CL_DEVICE_ENDIAN_LITTLE);
        }
    },

    //! is device available?
    available: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.Bool, this.cl.defs.CL_DEVICE_AVAILABLE);
        }
    },

    /**
     *    does the implementation have a compiler to compile the program source?
     *    This can be CL_FALSE for the embedded platform profile only.
     */
    compilerAvailable: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.Bool, this.cl.defs.CL_DEVICE_COMPILER_AVAILABLE);
        }
    },

    /**
     *    Describes the execution capabilities of the device.
     *
     *    Returns:
     *        a bit-field that describes one or more of the following values:
     *
     *        $(UL
     *        $(LI CL_EXEC_KERNEL – The OpenCL device can execute OpenCL kernels.)
     *        $(LI CL_EXEC_NATIVE_KERNEL – The OpenCL device can execute native kernels.))
     *
     *        The mandated minimum capability is: CL_EXEC_KERNEL.
     */
    deviceExecCapabilities: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.DeviceExecCapabilities, this.cl.defs.CL_DEVICE_EXECUTION_CAPABILITIES);
        }
    },

    /**
     *    Describes the command-queue properties supported by the device.
     *
     *    Returns:
     *        a bit-field that describes one or more of the following values:
     *
     *        $(UL
     *        $(LI CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE)
     *        $(LI CL_QUEUE_PROFILING_ENABLE))
     *
     *    TODO: make own functions for outOfOrder and profiling?
     */
    commandQueueProperties: {
        get: function () {
            this._throwIfReleased();
            return this._getInfo(this.cl.types.CommandQueueProperties, this.cl.defs.CL_DEVICE_QUEUE_PROPERTIES);
        }
    },

    /// get device name
    name: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DEVICE_NAME);
        }
    },

    /// get device vendor
    vendor: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DEVICE_VENDOR);
        }
    },

    /// get device OpenCL driver version in the form major_number.minor_number
    driverVersion: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DRIVER_VERSION);
        }
    },

    /**
     *    get OpenCL profile string
     *
     *    Returns:
     *        the profile name supported by the device.
     *        The profile name returned can be one of the following strings:
     *        $(UL
     *        $(LI FULL_PROFILE - if the device supports the OpenCL specification
     *        (functionality defined as part of the core specification and does not require
     *        any extensions to be supported).)
     *
     *        $(LI EMBEDDED_PROFILE - if the device supports the OpenCL embedded profile.))
     */
    profile: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DEVICE_PROFILE);
        }
    },

    /**
     * get OpenCL version string
     *
     * Returns:
     *        OpenCL version supported by the device.
     *        This version string has the following format:
     *        OpenCL<space><major_version.minor_version><space><vendor-specific information>
     */
    clVersion: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DEVICE_VERSION);
        }
    },

    /**
     *    Returns the highest OpenCL C version supported by the compiler for this device
     */
    clCVersion: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DEVICE_OPENCL_C_VERSION);
        }
    },

    numVersion: {
        get: function() {
            var m = /^OpenCL\sC\s(.*)/.exec(this.clCVersion);
            return parseFloat(m[1]);
        }
    },

    /**
     * get extensions supported by the device
     *
     * Returns:
     *        Returns a space separated list of extension names
     *        (the extension names themselves do not contain any spaces).
     */
    extensions: {
        get: function () {
            this._throwIfReleased();
            return this._getStringInfo(this.cl.defs.CL_DEVICE_EXTENSIONS);
        }
    }
});

CLDevice.prototype.createReleaseMethod = function () {
    if (this.cl.version >= 1.2) {
        var handle = this.handle;
        var cl = this.cl;
        return function() {
            cl.imports.clReleaseDevice(handle);
        }
    }
    return null;
};

module.exports = CLDevice;