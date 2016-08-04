'use strict';
const CLWrapper = require('./CLWrapper');

module.exports = CLDevice;

let CLPlatform = null;

class CLDevice extends CLWrapper {
    constructor(handle, platform) {
        super(handle);
        this._platform = platform || null;
        this._versionNum = 0;
        this._openCLCVersionNum = 0;
    }

    classInfoFunction() {
        return this.cl.getDeviceInfo;
    }

    get deviceType() {
        return this.getInfo(this.cl.DEVICE_TYPE);
    }

    get platform() {
        if (this._platform) {
            return this._platform;
        }
        if (!CLPlatform) {
            CLPlatform = require('./CLPlatform');
        }
        this._platform = new CLPlatform(this.getInfo(this.cl.DEVICE_PLATFORM));
    }

    get vendorID() {
        return this.getInfo(this.cl.DEVICE_VENDOR_ID);
    }

    get maxComputeUnits() {
        return this.getInfo(this.cl.DEVICE_MAX_COMPUTE_UNITS);
    }

    get maxWorkItemDimensions() {
        return this.getInfo(this.cl.DEVICE_MAX_WORK_ITEM_DIMENSIONS);
    }

    get maxWorkItemSizes() {
        return this.getArrayInfo(this.cl.DEVICE_MAX_WORK_ITEM_SIZES);
    }

    get maxWorkgroupSize() {
        return this.getInfo(this.cl.DEVICE_MAX_WORK_GROUP_SIZE);
    }

    get maxClockFrequency() {
        return this.getInfo(this.cl.DEVICE_MAX_CLOCK_FREQUENCY);
    }

    get addressBits() {
        return this.getInfo(this.cl.DEVICE_ADDRESS_BITS);
    }

    get maxMemAllocSize() {
        return this.getInfo(this.cl.DEVICE_MAX_MEM_ALLOC_SIZE);
    }

    get imageSupport() {
        return this.getInfo(this.cl.DEVICE_IMAGE_SUPPORT);
    }

    get maxReadImageArgs() {
        return this.getInfo(this.cl.DEVICE_MAX_READ_IMAGE_ARGS);
    }

    get maxWriteImageArgs() {
        return this.getInfo(this.cl.DEVICE_MAX_WRITE_IMAGE_ARGS);
    }

    get image2DMaxWidth() {
        return this.getInfo(this.cl.DEVICE_IMAGE2D_MAX_WIDTH);
    }

    get image2DMaxHeight() {
        return this.getInfo(this.cl.DEVICE_IMAGE2D_MAX_HEIGHT);
    }

    get image3DMaxWidth() {
        return this.getInfo(this.cl.DEVICE_IMAGE3D_MAX_WIDTH);
    }

    get image3DMaxHeight() {
        return this.getInfo(this.cl.DEVICE_IMAGE3D_MAX_HEIGHT);
    }

    get image3DMaxDepth() {
        return this.getInfo(this.cl.DEVICE_IMAGE3D_MAX_DEPTH);
    }

    get maxSamplers() {
        return this.getInfo(this.cl.DEVICE_MAX_SAMPLERS);
    }

    get maxParameterSize() {
        return this.getInfo(this.cl.DEVICE_MAX_PARAMETER_SIZE);
    }

    get memBaseAddrAlign() {
        return this.getInfo(this.cl.DEVICE_MEM_BASE_ADDR_ALIGN);
    }

    get minDataTypeAlignSize() {
        return this.getInfo(this.cl.DEVICE_MIN_DATA_TYPE_ALIGN_SIZE);
    }

    get singleFpConfig() {
        return this.getInfo(this.cl.DEVICE_SINGLE_FP_CONFIG);
    }

    get doubleFpConfig() {
        return this.getInfo(this.cl.DEVICE_DOUBLE_FP_CONFIG);
    }

    get globalMemCacheType() {
        return this.getInfo(this.cl.DEVICE_GLOBAL_MEM_CACHE_TYPE);
    }

    get globalMemCacheLineSize() {
        return this.getInfo(this.cl.DEVICE_GLOBAL_MEM_CACHELINE_SIZE);
    }

    get globalMemCacheSize() {
        return this.getInfo(this.cl.DEVICE_GLOBAL_MEM_CACHE_SIZE);
    }

    get globalMemSize() {
        return this.getInfo(this.cl.DEVICE_GLOBAL_MEM_SIZE);
    }

    get maxConstBufferSize() {
        return this.getInfo(this.cl.DEVICE_MAX_CONSTANT_BUFFER_SIZE);
    }

    get maxConstArgs() {
        return this.getInfo(this.cl.DEVICE_MAX_CONSTANT_ARGS);
    }

    get localMemType() {
        return this.getInfo(this.cl.DEVICE_LOCAL_MEM_TYPE);
    }

    get localMemSize() {
        return this.getInfo(this.cl.DEVICE_LOCAL_MEM_SIZE);
    }

    get errorCorrectionSupport() {
        return this.getInfo(this.cl.DEVICE_ERROR_CORRECTION_SUPPORT);
    }

    get hostUnifiedMemory() {
        return this.getInfo(this.cl.DEVICE_HOST_UNIFIED_MEMORY);
    }

    get profilingTimerResolution() {
        return this.getInfo(this.cl.DEVICE_PROFILING_TIMER_RESOLUTION);
    }

    get littleEndian() {
        return this.getInfo(this.cl.DEVICE_ENDIAN_LITTLE);
    }

    get available() {
        return this.getInfo(this.cl.DEVICE_AVAILABLE);
    }

    get compilerAvailable() {
        return this.getInfo(this.cl.DEVICE_COMPILER_AVAILABLE);
    }

    get deviceExecCapabilities() {
        return this.getInfo(this.cl.DEVICE_EXECUTION_CAPABILITIES);
    }

    get commandQueueProperties() {
        return this.getInfo(this.cl.DEVICE_QUEUE_PROPERTIES);
    }

    get name() {
        return this.getStringInfo(this.cl.DEVICE_NAME);
    }

    get vendor() {
        return this.getStringInfo(this.cl.DEVICE_VENDOR);
    }

    get driverVersion() {
        return this.getStringInfo(this.cl.DRIVER_VERSION);
    }

    get profile() {
        return this.getStringInfo(this.cl.DEVICE_PROFILE);
    }

    get version() {
        return this.getStringInfo(this.cl.DEVICE_VERSION);
    }

    get versionNum() {
        if (this._versionNum) {
            return this._versionNum;
        }
        this._versionNum = helpers.toVersionNum(this.version);
        return this._versionNum;
    }

    get openCLCVersion() {
        return this.getStringInfo(this.cl.DEVICE_OPENCL_C_VERSION);
    }

    get openCLCVersionNum() {
        if (this._openCLCVersionNum) {
            return this._openCLCVersionNum;
        }
        this._openCLCVersionNum = helpers.toVersionNum(this.openCLCVersion);
        return this._openCLCVersionNum;
    }

    get extensions() {
        return this.getStringInfo(this.cl.DEVICE_EXTENSIONS);
    }

    createReleaseMethod() {
        if (this.versionNum >= 1.2) {
            const handle = this.handle;
            const cl = this.cl;
            return () => cl.releaseDevice(handle);
        }
        return null;
    }
}