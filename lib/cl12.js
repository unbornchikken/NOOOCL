"use strict";

var util = require("util");
var CL11 = require("./cl11");
var _ = require("lodash");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var ffi = fastcall.ffi;

function CL12() {
    CL11.call(this);
    var types = this.types;
    this.version = 1.2;
    _.extend(
        this.imports,
        new ffi.Library(this.libName,
            {
                //   extern CL_API_ENTRY cl_int CL_API_CALL/
                //clCreateSubDevices(cl_device_id                         /* in_device */,
                //                   const cl_device_partition_property * /* properties */,
                //                   cl_uint                              /* num_devices */,
                //                 cl_device_id *                       /* out_devices */,
                //                   cl_uint *                            /* num_devices_ret */) CL_API_SUFFIX__VERSION_1_2;
                clCreateSubDevices: ["int", ["pointer", types.DevicePartitionProperties, "uint", ref.refType(types.DeviceId), types.ErrorCodeRet]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clRetainDevice(cl_device_id /* device */) CL_API_SUFFIX__VERSION_1_2;
                clRetainDevice: ["int", ["pointer"]],


                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clReleaseDevice(cl_device_id /* device */) CL_API_SUFFIX__VERSION_1_2;
                clReleaseDevice: ["int", ["pointer"]],

                //extern CL_API_ENTRY cl_mem CL_API_CALL
                //clCreateImage(cl_context              /* context */,
                //              cl_mem_flags            /* flags */,
                //              const cl_image_format * /* image_format */,
                //              const cl_image_desc *   /* image_desc */,
                //              void *                  /* host_ptr */,
                //              cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_2;
                clCreateImage: [types.Mem, ["pointer", types.MemFlags, types.ImageFormatRef, types.ImageDescRef, "pointer", types.ErrorCodeRet]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clCompileProgram(cl_program           /* program */,
                //                 cl_uint              /* num_devices */,
                //                 const cl_device_id * /* device_list */,
                //                 const char *         /* options */,
                //                 cl_uint              /* num_input_headers */,
                //                 const cl_program *   /* input_headers */,
                //                 const char **        /* header_include_names */,
                //                 void (CL_CALLBACK *  /* pfn_notify */)(cl_program /* program */, void * /* user_data */),
                //                 void *               /* user_data */) CL_API_SUFFIX__VERSION_1_2;
                clCompileProgram: ["int", [types.Program, "uint", types.DeviceIdArray, "string", "uint", types.ProgramArray, types.StringArray, types.BuildProgramNotify, "pointer"]],

                //extern CL_API_ENTRY cl_program CL_API_CALL/
                //clLinkProgram(cl_context           /* context */,
                //              cl_uint              /* num_devices */,
                //              const cl_device_id * /* device_list */,
                //              const char *         /* options */,
                //              cl_uint              /* num_input_programs */,
                //              const cl_program *   /* input_programs */,
                //              void (CL_CALLBACK *  /* pfn_notify */)(cl_program /* program */, void * /* user_data */),
                //              void *               /* user_data */,
                //              cl_int *             /* errcode_ret */ ) CL_API_SUFFIX__VERSION_1_2;
                clLinkProgram: [types.Program, [types.Context, "uint", types.DeviceIdArray, "string", "uint", types.ProgramArray, types.BuildProgramNotify, types.ErrorCodeRet, "pointer"]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clUnloadPlatformCompiler(cl_platform_id /* platform */) CL_API_SUFFIX__VERSION_1_2;
                clUnloadPlatformCompiler: ["int", [types.PlatformId]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clEnqueueFillBuffer(cl_command_queue   /* command_queue */,
                //                    cl_mem             /* buffer */,
                //                    const void *       /* pattern */,
                //                    size_t             /* pattern_size */,
                //                    size_t             /* offset */,
                //                    size_t             /* size */,
                //                    cl_uint            /* num_events_in_wait_list */,
                //                    const cl_event *   /* event_wait_list */,
                //                    cl_event *         /* event */) CL_API_SUFFIX__VERSION_1_2;
                clEnqueueFillBuffer: ["int", [types.CommandQueue, types.Mem, "pointer", "size_t", "size_t", "size_t", "uint", types.EventArray, types.EventRef]],


                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clEnqueueFillImage(cl_command_queue   /* command_queue */,
                //                   cl_mem             /* image */,
                //                   const void *       /* fill_color */,
                //                   const size_t *     /* origin[3] */,
                //                   const size_t *     /* region[3] */,
                //                   cl_uint            /* num_events_in_wait_list */,
                //                   const cl_event *   /* event_wait_list */,
                //                   cl_event *         /* event */) CL_API_SUFFIX__VERSION_1_2;
                clEnqueueFillImage: ["int", [types.CommandQueue, types.Mem, "pointer", types.SizeTArray, types.SizeTArray, "uint", types.EventArray, types.EventRef]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clEnqueueMigrateMemObjects(cl_command_queue       /* command_queue */,
                //                           cl_uint                /* num_mem_objects */,
                //                           const cl_mem *         /* mem_objects */,
                //                           cl_mem_migration_flags /* flags */,
                //                           cl_uint                /* num_events_in_wait_list */,
                //                           const cl_event *       /* event_wait_list */,
                //                           cl_event *             /* event */) CL_API_SUFFIX__VERSION_1_2;
                clEnqueueMigrateMemObjects: ["int", [types.CommandQueue, "uint", types.MemArray, types.MemMigrationFlags, "uint", types.EventArray, types.EventRef]],


                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clEnqueueMarkerWithWaitList(cl_command_queue /* command_queue */,
                //                            cl_uint           /* num_events_in_wait_list */,
                //                            const cl_event *  /* event_wait_list */,
                //                            cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_2;
                clEnqueueMarkerWithWaitList: ["int", [types.CommandQueue, "uint", types.EventArray, types.EventRef]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clEnqueueBarrierWithWaitList(cl_command_queue /* command_queue */,
                //                             cl_uint           /* num_events_in_wait_list */,
                //                             const cl_event *  /* event_wait_list */,
                //                             cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_2;
                clEnqueueBarrierWithWaitList: ["int", [types.CommandQueue, "uint", types.EventArray, types.EventRef]],

                //extern CL_API_ENTRY void * CL_API_CALL
                //clGetExtensionFunctionAddressForPlatform(cl_platform_id /* platform */,
                //                                         const char *   /* func_name */) CL_API_SUFFIX__VERSION_1_2;
                clGetExtensionFunctionAddressForPlatform: ["pointer", [types.PlatformId, "string"]],

                //extern CL_API_ENTRY cl_int CL_API_CALL
                //clGetKernelArgInfo(cl_kernel       /* kernel */,
                //                   cl_uint         /* arg_indx */,
                //                   cl_kernel_arg_info  /* param_name */,
                //                   size_t          /* param_value_size */,
                //                   void *          /* param_value */,
                //                   size_t *        /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_2;
                clGetKernelArgInfo: ["int", [types.Kernel, "uint", types.KernelArgInfo, "size_t", "pointer", ref.refType("size_t")]],

                //extern CL_API_ENTRY cl_program CL_API_CALL
                //clCreateProgramWithBuiltInKernels(cl_context            /* context */,
                //                                  cl_uint               /* num_devices */,
                //                                  const cl_device_id *  /* device_list */,
                //                                  const char *          /* kernel_names */,
                //                                  cl_int *              /* errcode_ret */) CL_API_SUFFIX__VERSION_1_2;
                clCreateProgramWithBuiltInKernels: [types.Program, [types.Context, "uint", types.DeviceIdArray, "string", types.ErrorCodeRet]]
            }));
}

util.inherits(CL12, CL11);

module.exports = CL12;