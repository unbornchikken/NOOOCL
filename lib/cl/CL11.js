var _ = require('lodash');
var ref = require('ref');
var ffi = require('ffi');
var types = require('./types');
var defs = require('./defs');

var libName = /^win/.test(process.platform) ? "OpenCL" : "libOpenCL.so";

function CL11() {
    this.types = types;
    this.defs = defs;
    this.version = 1.1;
}

CL11.types = types;

CL11.defs = defs;

CL11.prototype._lib11 = ffi.DynamicLibrary(libName,
    {
        /* Platform APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetPlatformIDs(cl_uint          /* num_entries */,
        //                 cl_platform_id * /* platforms */,
        //                cl_uint *        /* num_platforms */) CL_API_SUFFIX__VERSION_1_0;
        getPlatformIDs: [ref.types.int, [ref.types.uint, ref.types.pointer, ref.refType(ref.types.uint)]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetPlatformInfo(cl_platform_id   /* platform */,
        //                  cl_platform_info /* param_name */,
        //                  size_t           /* param_value_size */,
        //                  void *           /* param_value */,
        //                  size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        getPlatformInfo: [ref.types.int, [types.platformId, types.platformInfo, ref.types.size_t, ref.types.pointer, ref.refType(ref.types.size_t)]],

        /* Device APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetDeviceIDs(cl_platform_id   /* platform */,
        //               cl_device_type   /* device_type */,
        //               cl_uint          /* num_entries */,
        //               cl_device_id *   /* devices */,
        //               cl_uint *        /* num_devices */) CL_API_SUFFIX__VERSION_1_0;
        getDeviceIDs: [ref.types.int, [types.platformId, types.deviceType, ref.types.uint, ref.types.pointer, ref.refType(ref.types.uint)]],
        
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetDeviceInfo(cl_device_id    /* device */,
        //                cl_device_info  /* param_name */,
        //               size_t          /* param_value_size */,
        //               void *          /* param_value */,
        //               size_t *        /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        getDeviceInfo: [ref.types.int, [types.platformId, types.deviceInfo, ref.types.size_t, ref.types.pointer, ref.refType(ref.types.size_t)]],
        
        /* Context APIs  */
        //extern CL_API_ENTRY cl_context CL_API_CALL
        //clCreateContext(const cl_context_properties * /* properties */,
        //                cl_uint                 /* num_devices */,
        //                const cl_device_id *    /* devices */,
        //                void (CL_CALLBACK * /* pfn_notify */)(const char *, const void *, size_t, void *),
        //                void *                  /* user_data */,
        //                cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        createContext: [ref.types.pointer, [ref.types.pointer, ref.types.uint, ref.types.pointer, types.createContextNotify, ref.types.pointer, ref.refType(ref.types.int)]],
        
        //extern CL_API_ENTRY cl_context CL_API_CALL
        //clCreateContextFromType(const cl_context_properties * /* properties */,
        //                        cl_device_type          /* device_type */,
        //                        void (CL_CALLBACK *     /* pfn_notify*/ )(const char *, const void *, size_t, void *),
        //                        void *                  /* user_data */,
        //                        cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        createContextFromType: [ref.types.pointer, [ref.types.pointer, types.deviceType, types.createContextNotify, ref.types.pointer, ref.refType(ref.types.int)]]
    });

_.extend(CL11.prototype, CL11.prototypes._lib11);

module.exports = CL11;
