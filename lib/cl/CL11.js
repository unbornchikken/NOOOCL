var _ = require('lodash');
var ref = require('ref');
var ffi = require('ffi');
var types = require('./types');
var defs = require('./defs');
var clHelpers = require('./clHelpers');

var libName = /^win/.test(process.platform) ? "OpenCL" : "libOpenCL.so";

var lib11 = ffi.Library(libName,
    {
        /* Platform APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetPlatformIDs(cl_uint          /* num_entries */,
        //                 cl_platform_id * /* platforms */,
        //                cl_uint *        /* num_platforms */) CL_API_SUFFIX__VERSION_1_0;
        clGetPlatformIDs: [ref.types.int, [ref.types.uint, types.PlatformIdArray, ref.refType(ref.types.uint)]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetPlatformInfo(cl_platform_id   /* platform */,
        //                  cl_platform_info /* param_name */,
        //                  size_t           /* param_value_size */,
        //                  void *           /* param_value */,
        //                  size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetPlatformInfo: [ref.types.int, [types.platformId, types.platformInfo, ref.types.size_t, ref.refType('void'), ref.refType(ref.types.size_t)]],

        /* Device APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetDeviceIDs(cl_platform_id   /* platform */,
        //               cl_device_type   /* device_type */,
        //               cl_uint          /* num_entries */,
        //               cl_device_id *   /* devices */,
        //               cl_uint *        /* num_devices */) CL_API_SUFFIX__VERSION_1_0;
        clGetDeviceIDs: [ref.types.int, [types.platformId, types.deviceType, ref.types.uint, types.DeviceIdArray, ref.refType(ref.types.uint)]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetDeviceInfo(cl_device_id    /* device */,
        //                cl_device_info  /* param_name */,
        //               size_t          /* param_value_size */,
        //               void *          /* param_value */,
        //               size_t *        /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetDeviceInfo: [ref.types.int, [types.platformId, types.deviceInfo, ref.types.size_t, ref.refType('void'), ref.refType(ref.types.size_t)]],

        /* Context APIs  */
        //extern CL_API_ENTRY cl_context CL_API_CALL
        //clCreateContext(const cl_context_properties * /* properties */,
        //                cl_uint                 /* num_devices */,
        //                const cl_device_id *    /* devices */,
        //                void (CL_CALLBACK * /* pfn_notify */)(const char *, const void *, size_t, void *),
        //                void *                  /* user_data */,
        //                cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateContext: [ref.refType('void'), [ref.refType('void'), ref.types.uint, ref.refType('void'), types.createContextNotify, ref.refType('void'), ref.refType(ref.types.int)]],

        //extern CL_API_ENTRY cl_context CL_API_CALL
        //clCreateContextFromType(const cl_context_properties * /* properties */,
        //                        cl_device_type          /* device_type */,
        //                        void (CL_CALLBACK *     /* pfn_notify*/ )(const char *, const void *, size_t, void *),
        //                        void *                  /* user_data */,
        //                        cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateContextFromType: [ref.refType('void'), [ref.refType('void'), types.deviceType, types.createContextNotify, ref.refType('void'), ref.refType(ref.types.int)]]
    });

function CL11() {
    this.types = types;
    this.defs = defs;
    this.version = 1.1;
}

CL11.types = types;

CL11.defs = defs;

CL11.prototype.checkError = function(err) {
    if (err) {
        throw new Error('OpenCL error. Code: ' + err);
    }
};

clHelpers.importFunctions(CL11.prototype, lib11);

module.exports = CL11;
