"use strict";

var _ = require("lodash");
var fastcall = require("fastcall");
var ref = fastcall.ref;
var ffi = fastcall.ffi;
var types = require("./types");
var defs = require("./clDefines");
var CLError = require("./clError");

function CL11() {
    this.types = types;
    this.defs = defs;
    this.version = 1.1;
    this.libName = (process.platform === "win32") ? "OpenCL" : (process.platform === "darwin") ? "/System/Library/Frameworks/OpenCL.framework/OpenCL" : "libOpenCL.so";
    this.imports = new ffi.Library(this.libName,
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
            clGetPlatformInfo: [ref.types.int, [types.PlatformId, types.PlatformInfo, ref.types.size_t, "pointer", ref.refType(ref.types.size_t)]],

            /* Device APIs */
            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetDeviceIDs(cl_platform_id   /* platform */,
            //               cl_device_type   /* device_type */,
            //               cl_uint          /* num_entries */,
            //               cl_device_id *   /* devices */,
            //               cl_uint *        /* num_devices */) CL_API_SUFFIX__VERSION_1_0;
            clGetDeviceIDs: [ref.types.int, [types.PlatformId, types.DeviceType, ref.types.uint, types.DeviceIdArray, ref.refType(ref.types.uint)]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetDeviceInfo(cl_device_id    /* device */,
            //                cl_device_info  /* param_name */,
            //               size_t          /* param_value_size */,
            //               void *          /* param_value */,
            //               size_t *        /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetDeviceInfo: [ref.types.int, [types.PlatformId, types.DeviceInfo, ref.types.size_t, "pointer", ref.refType(ref.types.size_t)]],

            /* Context APIs  */
            //extern CL_API_ENTRY cl_context CL_API_CALL
            //clCreateContext(const cl_context_properties * /* properties */,
            //                cl_uint                 /* num_devices */,
            //                const cl_device_id *    /* devices */,
            //                void (CL_CALLBACK * /* pfn_notify */)(const char *, const void *, size_t, void *),
            //                void *                  /* user_data */,
            //                cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateContext: ["pointer", [types.ContextProperties, ref.types.uint, types.DeviceIdArray, ref.refType(types.CreateContextNotify), "pointer", types.ErrorCodeRet]],

            //extern CL_API_ENTRY cl_context CL_API_CALL
            //clCreateContextFromType(const cl_context_properties * /* properties */,
            //                        cl_device_type          /* device_type */,
            //                        void (CL_CALLBACK *     /* pfn_notify*/ )(const char *, const void *, size_t, void *),
            //                        void *                  /* user_data */,
            //                        cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateContextFromType: ["pointer", [types.ContextProperties, types.DeviceType, ref.refType(types.CreateContextNotify), "pointer", types.ErrorCodeRet]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainContext(cl_context /* context */) CL_API_SUFFIX__VERSION_1_0;
            clRetainContext: ["int", [types.Context]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseContext(cl_context /* context */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseContext: ["int", [types.Context]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetContextInfo(cl_context         /* context */,
            //                 cl_context_info    /* param_name */,
            //                 size_t             /* param_value_size */,
            //                 void *             /* param_value */,
            //                 size_t *           /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetContextInfo: ["int", [types.Context, types.ContextInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Command Queue APIs */
            //extern CL_API_ENTRY cl_command_queue CL_API_CALL
            //clCreateCommandQueue(cl_context                     /* context */,
            //                     cl_device_id                   /* device */,
            //                     cl_command_queue_properties    /* properties */,
            //                     cl_int *                       /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateCommandQueue: [types.CommandQueue, [types.Context, types.DeviceId, types.CommandQueueProperties, ref.refType("int")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainCommandQueue(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
            clRetainCommandQueue: ["int", [types.CommandQueue]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseCommandQueue(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseCommandQueue: ["int", [types.CommandQueue]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetCommandQueueInfo(cl_command_queue      /* command_queue */,
            //                      cl_command_queue_info /* param_name */,
            //                      size_t                /* param_value_size */,
            //                      void *                /* param_value */,
            //                      size_t *              /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetCommandQueueInfo: ["int", [types.CommandQueue, types.CommandQueueInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Memory Object APIs */
            //extern CL_API_ENTRY cl_mem CL_API_CALL
            //clCreateBuffer(cl_context   /* context */,
            //               cl_mem_flags /* flags */,
            //               size_t       /* size */,
            //               void *       /* host_ptr */,
            //               cl_int *     /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateBuffer: [types.Mem, [types.Context, types.MemFlags, "size_t", "pointer", ref.refType("int")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainMemObject(cl_mem /* memobj */) CL_API_SUFFIX__VERSION_1_0;
            clRetainMemObject: ["int", [types.Mem]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseMemObject(cl_mem /* memobj */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseMemObject: ["int", [types.Mem]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetSupportedImageFormats(cl_context           /* context */,
            //                           cl_mem_flags         /* flags */,
            //                           cl_mem_object_type   /* image_type */,
            //                           cl_uint              /* num_entries */,
            //                           cl_image_format *    /* image_formats */,
            //                           cl_uint *            /* num_image_formats */) CL_API_SUFFIX__VERSION_1_0;
            clGetSupportedImageFormats: ["int", [types.Context, types.MemFlags, types.MemObjectType, "uint", types.ImageFormatArray, ref.refType("uint")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetMemObjectInfo(cl_mem           /* memobj */,
            //                   cl_mem_info      /* param_name */,
            //                   size_t           /* param_value_size */,
            //                   void *           /* param_value */,
            //                   size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetMemObjectInfo: ["int", [types.Mem, types.MemInfo, "size_t", "pointer", ref.refType("size_t")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetImageInfo(cl_mem           /* image */,
            //               cl_image_info    /* param_name */,
            //               size_t           /* param_value_size */,
            //               void *           /* param_value */,
            //               size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetImageInfo: ["int", [types.Mem, types.ImageInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Sampler APIs */
            //extern CL_API_ENTRY cl_sampler CL_API_CALL
            //clCreateSampler(cl_context          /* context */,
            //                cl_bool             /* normalized_coords */,
            //                cl_addressing_mode  /* addressing_mode */,
            //                cl_filter_mode      /* filter_mode */,
            //                cl_int *            /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateSampler: [types.Sampler, [types.Context, types.Bool, types.AddressingMode, types.FilterMode, ref.refType("int")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainSampler(cl_sampler /* sampler */) CL_API_SUFFIX__VERSION_1_0;
            clRetainSampler: ["int", [types.Sampler]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseSampler(cl_sampler /* sampler */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseSampler: ["int", [types.Sampler]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetSamplerInfo(cl_sampler         /* sampler */,
            //                 cl_sampler_info    /* param_name */,
            //                 size_t             /* param_value_size */,
            //                 void *             /* param_value */,
            //                 size_t *           /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetSamplerInfo: ["int", [types.Sampler, types.SamplerInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Program Object APIs  */
            //extern CL_API_ENTRY cl_program CL_API_CALL
            //clCreateProgramWithSource(cl_context        /* context */,
            //                          cl_uint           /* count */,
            //                          const char **     /* strings */,
            //                          const size_t *    /* lengths */,
            //                          cl_int *          /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateProgramWithSource: [types.Program, [types.Context, "uint", types.StringArray, types.SizeTArray, ref.refType("int")]],

            //extern CL_API_ENTRY cl_program CL_API_CALL
            //clCreateProgramWithBinary(cl_context                     /* context */,
            //                          cl_uint                        /* num_devices */,
            //                          const cl_device_id *           /* device_list */,
            //                          const size_t *                 /* lengths */,
            //                          const unsigned char **         /* binaries */,
            //                          cl_int *                       /* binary_status */,
            //                          cl_int *                       /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateProgramWithBinary: [types.Program, [types.Context, "uint", types.DeviceIdArray, types.SizeTArray, types.Binaries, ref.refType("int"), ref.refType("int")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainProgram(cl_program /* program */) CL_API_SUFFIX__VERSION_1_0;
            clRetainProgram: ["int", [types.Program]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseProgram(cl_program /* program */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseProgram: ["int", [types.Program]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clBuildProgram(cl_program           /* program */,
            //              cl_uint              /* num_devices */,
            //              const cl_device_id * /* device_list */,
            //              const char *         /* options */,
            //              void (CL_CALLBACK *  /* pfn_notify */)(cl_program /* program */, void * /* user_data */),
            //              void *               /* user_data */) CL_API_SUFFIX__VERSION_1_0;
            clBuildProgram: ["int", [types.Program, "uint", types.DeviceIdArray, "string", types.BuildProgramNotify, "pointer"]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetProgramInfo(cl_program         /* program */,
            //                 cl_program_info    /* param_name */,
            //                 size_t             /* param_value_size */,
            //                 void *             /* param_value */,
            //                 size_t *           /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetProgramInfo: ["int", [types.Program, types.ProgramInfo, "size_t", "pointer", ref.refType("size_t")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetProgramBuildInfo(cl_program            /* program */,
            //                      cl_device_id          /* device */,
            //                      cl_program_build_info /* param_name */,
            //                      size_t                /* param_value_size */,
            //                      void *                /* param_value */,
            //                      size_t *              /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetProgramBuildInfo: ["int", [types.Program, types.DeviceId, types.ProgramBuildInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Kernel Object APIs */
            //extern CL_API_ENTRY cl_kernel CL_API_CALL
            //clCreateKernel(cl_program      /* program */,
            //               const char *    /* kernel_name */,
            //               cl_int *        /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateKernel: [types.Kernel, [types.Program, "string", ref.refType("int")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clCreateKernelsInProgram(cl_program     /* program */,
            //                         cl_uint        /* num_kernels */,
            //                         cl_kernel *    /* kernels */,
            //                         cl_uint *      /* num_kernels_ret */) CL_API_SUFFIX__VERSION_1_0;
            clCreateKernelsInProgram: ["int", [types.Program, "uint", types.KernelArray, ref.refType("uint")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainKernel(cl_kernel    /* kernel */) CL_API_SUFFIX__VERSION_1_0;
            clRetainKernel: ["int", [types.Kernel]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseKernel(cl_kernel   /* kernel */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseKernel: ["int", [types.Kernel]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clSetKernelArg(cl_kernel    /* kernel */,
            //               cl_uint      /* arg_index */,
            //               size_t       /* arg_size */,
            //               const void * /* arg_value */) CL_API_SUFFIX__VERSION_1_0;
            clSetKernelArg: ["int", [types.Kernel, "uint", "size_t", "pointer"]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetKernelInfo(cl_kernel       /* kernel */,
            //                cl_kernel_info  /* param_name */,
            //                size_t          /* param_value_size */,
            //                void *          /* param_value */,
            //                size_t *        /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetKernelInfo: ["int", [types.Kernel, types.KernelInfo, "size_t", "pointer", ref.refType("size_t")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetKernelWorkGroupInfo(cl_kernel                  /* kernel */,
            //                         cl_device_id               /* device */,
            //                         cl_kernel_work_group_info  /* param_name */,
            //                         size_t                     /* param_value_size */,
            //                         void *                     /* param_value */,
            //                         size_t *                   /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetKernelWorkGroupInfo: ["int", [types.Kernel, types.DeviceId, types.KernelWorkGroupInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Event Object APIs */
            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clWaitForEvents(cl_uint             /* num_events */,
            //                const cl_event *    /* event_list */) CL_API_SUFFIX__VERSION_1_0;
            clWaitForEvents: ["int", ["uint", types.EventArray]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetEventInfo(cl_event         /* event */,
            //               cl_event_info    /* param_name */,
            //               size_t           /* param_value_size */,
            //               void *           /* param_value */,
            //               size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            clGetEventInfo: ["int", [types.Event, types.EventInfo, "size_t", "pointer", ref.refType("size_t")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clRetainEvent(cl_event /* event */) CL_API_SUFFIX__VERSION_1_0;
            clRetainEvent: ["int", [types.Event]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseEvent(cl_event /* event */) CL_API_SUFFIX__VERSION_1_0;
            clReleaseEvent: ["int", [types.Event]],

            /* Profiling APIs */
            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clGetEventProfilingInfo(cl_event            /* event */,
            //                        cl_profiling_info   /* param_name */,
            //                        size_t              /* param_value_size */,
            //                        void *              /* param_value */,
            //                        size_t *            /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clReleaseEvent(cl_event /* event */) CL_API_SUFFIX__VERSION_1_0;
            clGetEventProfilingInfo: ["int", [types.Event, types.ProfilingInfo, "size_t", "pointer", ref.refType("size_t")]],

            /* Flush and Finish APIs */
            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clFlush(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
            clFlush: ["int", [types.CommandQueue]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clFinish(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
            clFinish: ["int", [types.CommandQueue]],

            /* Enqueued Commands APIs */
            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueReadBuffer(cl_command_queue    /* command_queue */,
            //                   cl_mem              /* buffer */,
            //                    cl_bool             /* blocking_read */,
            //                    size_t              /* offset */,
            //                    size_t              /* size */,
            //                    void *              /* ptr */,
            //                    cl_uint             /* num_events_in_wait_list */,
            //                    const cl_event *    /* event_wait_list */,
            //                    cl_event *          /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueReadBuffer: ["int", [types.CommandQueue, types.Mem, types.Bool, "size_t", "size_t", "pointer", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueWriteBuffer(cl_command_queue   /* command_queue */,
            //                     cl_mem             /* buffer */,
            //                     cl_bool            /* blocking_write */,
            //                     size_t             /* offset */,
            //                     size_t             /* size */,
            //                     const void *       /* ptr */,
            //                     cl_uint            /* num_events_in_wait_list */,
            //                     const cl_event *   /* event_wait_list */,
            //                     cl_event *         /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueWriteBuffer: ["int", [types.CommandQueue, types.Mem, types.Bool, "size_t", "size_t", "pointer", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueCopyBuffer(cl_command_queue    /* command_queue */,
            //                    cl_mem              /* src_buffer */,
            //                    cl_mem              /* dst_buffer */,
            //                    size_t              /* src_offset */,
            //                    size_t              /* dst_offset */,
            //                    size_t              /* size */,
            //                    cl_uint             /* num_events_in_wait_list */,
            //                   const cl_event *    /* event_wait_list */,
            //                    cl_event *          /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueCopyBuffer: ["int", [types.CommandQueue, types.Mem, types.Mem, "size_t", "size_t", "size_t", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueReadImage(cl_command_queue     /* command_queue */,
            //                   cl_mem               /* image */,
            //                   cl_bool              /* blocking_read */,
            //                   const size_t *       /* origin[3] */,
            //                   const size_t *       /* region[3] */,
            //                   size_t               /* row_pitch */,
            //                   size_t               /* slice_pitch */,
            //                   void *               /* ptr */,
            //                   cl_uint              /* num_events_in_wait_list */,
            //                   const cl_event *     /* event_wait_list */,
            //                   cl_event *           /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueReadImage: ["int", [types.CommandQueue, types.Mem, types.Bool, types.SizeTArray, types.SizeTArray, "size_t", "size_t", "pointer", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL/
            //clEnqueueWriteImage(cl_command_queue    /* command_queue */,
            //                    cl_mem              /* image */,
            //                    cl_bool             /* blocking_write */,
            //                    const size_t *      /* origin[3] */,
            //                    const size_t *      /* region[3] */,
            //                    size_t              /* input_row_pitch */,
            //                    size_t              /* input_slice_pitch */,
            //                    const void *        /* ptr */,
            //                    cl_uint             /* num_events_in_wait_list */,
            //                   const cl_event *    /* event_wait_list */,
            //                    cl_event *          /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueWriteImage: ["int", [types.CommandQueue, types.Mem, types.Bool, types.SizeTArray, types.SizeTArray, "size_t", "size_t", "pointer", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueCopyImage(cl_command_queue     /* command_queue */,
            //                   cl_mem               /* src_image */,
            //                   cl_mem               /* dst_image */,
            //                   const size_t *       /* src_origin[3] */,
            //                   const size_t *       /* dst_origin[3] */,
            //                   const size_t *       /* region[3] */,
            //                   cl_uint              /* num_events_in_wait_list */,
            //                   const cl_event *     /* event_wait_list */,
            //                   cl_event *           /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueCopyImage: ["int", [types.CommandQueue, types.Mem, types.Mem, types.SizeTArray, types.SizeTArray, types.SizeTArray, "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueCopyImageToBuffer(cl_command_queue /* command_queue */,
            //                           cl_mem           /* src_image */,
            //                           cl_mem           /* dst_buffer */,
            //                           const size_t *   /* src_origin[3] */,
            //                           const size_t *   /* region[3] */,
            //                           size_t           /* dst_offset */,
            //                           cl_uint          /* num_events_in_wait_list */,
            //                           const cl_event * /* event_wait_list */,
            //                           cl_event *       /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueCopyImageToBuffer: ["int", [types.CommandQueue, types.Mem, types.Mem, types.SizeTArray, types.SizeTArray, "size_t", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueCopyBufferToImage(cl_command_queue /* command_queue */,
            //                           cl_mem           /* src_buffer */,
            //                           cl_mem           /* dst_image */,
            //                           size_t           /* src_offset */,
            //                           const size_t *   /* dst_origin[3] */,
            //                           const size_t *   /* region[3] */,
            //                           cl_uint          /* num_events_in_wait_list */,
            //                           const cl_event * /* event_wait_list */,
            //                           cl_event *       /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueCopyBufferToImage: ["int", [types.CommandQueue, types.Mem, types.Mem, "size_t", types.SizeTArray, types.SizeTArray, "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY void * CL_API_CALL
            //clEnqueueMapBuffer(cl_command_queue /* command_queue */,
            //                   cl_mem           /* buffer */,
            //                   cl_bool          /* blocking_map */,
            //                   cl_map_flags     /* map_flags */,
            //                   size_t           /* offset */,
            //                   size_t           /* size */,
            //                   cl_uint          /* num_events_in_wait_list */,
            //                   const cl_event * /* event_wait_list */,
            //                   cl_event *       /* event */,
            //                   cl_int *         /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueMapBuffer: ["pointer", [types.CommandQueue, types.Mem, types.Bool, types.MapFlags, "size_t", "size_t", "uint", types.EventArray, types.EventRef, ref.refType("int")]],

            //extern CL_API_ENTRY void * CL_API_CALL
            //clEnqueueMapImage(cl_command_queue  /* command_queue */,
            //                  cl_mem            /* image */,
            //                  cl_bool           /* blocking_map */,
            //                  cl_map_flags      /* map_flags */,
            //                  const size_t *    /* origin[3] */,
            //                  const size_t *    /* region[3] */,
            //                  size_t *          /* image_row_pitch */,
            //                  size_t *          /* image_slice_pitch */,
            //                  cl_uint           /* num_events_in_wait_list */,
            //                  const cl_event *  /* event_wait_list */,
            //                  cl_event *        /* event */,
            //                  cl_int *          /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueMapImage: ["pointer", [types.CommandQueue, types.Mem, types.Bool, types.MapFlags, types.SizeTArray, types.SizeTArray, ref.refType("size_t"), ref.refType("size_t"), "uint", types.EventArray, types.EventRef, ref.refType("int")]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueUnmapMemObject(cl_command_queue /* command_queue */,
            //                        cl_mem           /* memobj */,
            //                        void *           /* mapped_ptr */,
            //                        cl_uint          /* num_events_in_wait_list */,
            //                        const cl_event *  /* event_wait_list */,
            //                        cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueUnmapMemObject: ["int", [types.CommandQueue, types.Mem, "pointer", "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueNDRangeKernel(cl_command_queue /* command_queue */,
            //                       cl_kernel        /* kernel */,
            //                       cl_uint          /* work_dim */,
            //                       const size_t *   /* global_work_offset */,
            //                       const size_t *   /* global_work_size */,
            //                       const size_t *   /* local_work_size */,
            //                       cl_uint          /* num_events_in_wait_list */,
            //                       const cl_event * /* event_wait_list */,
            //                       cl_event *       /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueNDRangeKernel: ["int", [types.CommandQueue, types.Kernel, "uint", types.SizeTArray, types.SizeTArray, types.SizeTArray, "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueTask(cl_command_queue  /* command_queue */,
            //              cl_kernel         /* kernel */,
            //              cl_uint           /* num_events_in_wait_list */,
            //              const cl_event *  /* event_wait_list */,
            //              cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueTask: ["int", [types.CommandQueue, types.Kernel, "uint", types.EventArray, types.EventRef]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueNativeKernel(cl_command_queue  /* command_queue */,
            //					  void (CL_CALLBACK * /*user_func*/)(void *),
            //                      void *            /* args */,
            //                      size_t            /* cb_args */,
            //                      cl_uint           /* num_mem_objects */,
            //                      const cl_mem *    /* mem_list */,
            //                      const void **     /* args_mem_loc */,
            //                      cl_uint           /* num_events_in_wait_list */,
            //                      const cl_event *  /* event_wait_list */,
            //                      cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_0;
            clEnqueueNativeKernel: ["int", [types.CommandQueue, types.EnqueueNativeKernelUserFunc, "pointer", "size_t", "uint", types.MemArray, ref.refType("pointer"), "uint", types.EventArray, types.EventRef]],

            /*1.1*/
            //extern CL_API_ENTRY cl_mem CL_API_CALL
            //clCreateSubBuffer(cl_mem                   /* buffer */,
            //                  cl_mem_flags             /* flags */,
            //                  cl_buffer_create_type    /* buffer_create_type */,
            //                  const void *             /* buffer_create_info */,
            //                  cl_int *                 /* errcode_ret */) CL_API_SUFFIX__VERSION_1_1;
            clCreateSubBuffer: [types.Mem, [types.Mem, types.MemFlags, types.BufferCreateType, "pointer", types.ErrorCodeRet]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clSetMemObjectDestructorCallback(  cl_mem /* memobj */,
            //                                    void (CL_CALLBACK * /*pfn_notify*/)( cl_mem /* memobj */, void* /*user_data*/),
            //                                    void * /*user_data */ )             CL_API_SUFFIX__VERSION_1_1;
            clSetMemObjectDestructorCallback: ["int", [types.Mem, types.SetEventCallbackCallback, "pointer"]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clSetUserEventStatus(cl_event   /* event */,
            //                    cl_int     /* execution_status */) CL_API_SUFFIX__VERSION_1_1;
            clSetUserEventStatus: ["int", [types.Event, "int"]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clSetEventCallback( cl_event    /* event */,
            //                    cl_int      /* command_exec_callback_type */,
            //                    void (CL_CALLBACK * /* pfn_notify */)(cl_event, cl_int, void *),
            //                    void *      /* user_data */) CL_API_SUFFIX__VERSION_1_1;
            clSetEventCallback: ["int", [types.Event, "int", types.SetEventCallbackCallback, "pointer"]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueReadBufferRect(cl_command_queue    /* command_queue */,
            //                        cl_mem              /* buffer */,
            //                        cl_bool             /* blocking_read */,
            //                        const size_t *      /* buffer_offset */,
            //                        const size_t *      /* host_offset */,
            //                        const size_t *      /* region */,
            //                        size_t              /* buffer_row_pitch */,
            //                        size_t              /* buffer_slice_pitch */,
            //                        size_t              /* host_row_pitch */,
            //                        size_t              /* host_slice_pitch */,
            //                        void *              /* ptr */,
            //                        cl_uint             /* num_events_in_wait_list */,
            //                        const cl_event *    /* event_wait_list */,
            //                        cl_event *          /* event */) CL_API_SUFFIX__VERSION_1_1;
            clEnqueueReadBufferRect: [
                "int",
                [
                    types.CommandQueue,
                    types.Mem,
                    types.Bool,
                    ref.refType("size_t"),
                    ref.refType("size_t"),
                    ref.refType("size_t"),
                    "size_t",
                    "size_t",
                    "size_t",
                    "size_t",
                    "pointer",
                    "uint",
                    types.EventArray,
                    types.EventRef
                ]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueWriteBufferRect(cl_command_queue    /* command_queue */,
            //                         cl_mem              /* buffer */,
            //                         cl_bool             /* blocking_write */,
            //                         const size_t *      /* buffer_offset */,
            //                         const size_t *      /* host_offset */,
            //                         const size_t *      /* region */,
            //                         size_t              /* buffer_row_pitch */,
            //                         size_t              /* buffer_slice_pitch */,
            //                         size_t              /* host_row_pitch */,
            //                         size_t              /* host_slice_pitch */,
            //                         const void *        /* ptr */,
            //                         cl_uint             /* num_events_in_wait_list */,
            //                         const cl_event *    /* event_wait_list */,
            //                         cl_event *          /* event */) CL_API_SUFFIX__VERSION_1_1;
            clEnqueueWriteBufferRect: [
                "int",
                [
                    types.CommandQueue,
                    types.Mem,
                    types.Bool,
                    ref.refType("size_t"),
                    ref.refType("size_t"),
                    ref.refType("size_t"),
                    "size_t",
                    "size_t",
                    "size_t",
                    "size_t",
                    "pointer",
                    "uint",
                    types.EventArray,
                    types.EventRef
                ]],

            //extern CL_API_ENTRY cl_int CL_API_CALL
            //clEnqueueCopyBufferRect(cl_command_queue    /* command_queue */,
            //                        cl_mem              /* src_buffer */,
            //                        cl_mem              /* dst_buffer */,
            //                        const size_t *      /* src_origin */,
            //                        const size_t *      /* dst_origin */,
            //                        const size_t *      /* region */,
            //                        size_t              /* src_row_pitch */,
            //                        size_t              /* src_slice_pitch */,
            //                        size_t              /* dst_row_pitch */,
            //                        size_t              /* dst_slice_pitch */,
            //                        cl_uint             /* num_events_in_wait_list */,
            //                        const cl_event *    /* event_wait_list */,
            //                        cl_event *          /* event */) CL_API_SUFFIX__VERSION_1_1;
            clEnqueueCopyBufferRect: [
                "int",
                [
                    types.CommandQueue,
                    types.Mem,
                    types.Mem,
                    types.Bool,
                    ref.refType("size_t"),
                    ref.refType("size_t"),
                    ref.refType("size_t"),
                    "size_t",
                    "size_t",
                    "size_t",
                    "size_t",
                    "uint",
                    types.EventArray,
                    types.EventRef
                ]],

            //extern CL_API_ENTRY cl_event CL_API_CALL
            //clCreateUserEvent(cl_context    /* context */,
            //                 cl_int *      /* errcode_ret */) CL_API_SUFFIX__VERSION_1_1;
            clCreateUserEvent: [types.Event, [types.Context, ref.refType("int")]],

            /*
             cl_int clGetGLObjectInfo (	cl_mem memobj,
                 cl_gl_object_type *gl_object_type,
                 GLuint *gl_object_name)
             */
            clGetGLObjectInfo: ["int", [ref.refType("uint"), ref.refType("uint")]],

            /*
            cl_int clEnqueueWaitForEvents (
                cl_command_queue command_queue,
                cl_uint num_events,
                const cl_event *event_list)
            */
            clEnqueueWaitForEvents: ["int", [types.CommandQueue, "uint", types.EventArray]],

            /*
             cl_int clEnqueueMarker (
                cl_command_queue command_queue,
                cl_event *event)
             */
            clEnqueueMarker: ["int", [types.CommandQueue, types.EventRef]],

            /*
             cl_int clEnqueueBarrier (
             cl_command_queue command_queue,
             cl_event *event)
             */
            clEnqueueBarrier: ["int", [types.CommandQueue, types.EventRef]],

            /*
             cl_mem clCreateImage2D (
                 cl_context context,
                 cl_mem_flags flags,
                 const cl_image_format *image_format,
                 size_t image_width,
                 size_t image_height,
                 size_t image_row_pitch,
                 void *host_ptr,
                 cl_int *errcode_ret)
             */
            clCreateImage2D: [types.Mem,
                [
                    types.Context,
                    types.MemFlags,
                    types.ImageFormatRef,
                    "size_t",
                    "size_t",
                    "size_t",
                    "pointer",
                    types.ErrorCodeRet
                ]
            ],

            /*
             cl_mem clCreateImage3D (
                 cl_context context,
                 cl_mem_flags flags,
                 const cl_image_format *image_format,
                 size_t image_width,
                 size_t image_height,
                 size_t image_depth,
                 size_t image_row_pitch,
                 size_t image_slice_pitch,
                 void *host_ptr,
                 cl_int *errcode_ret)
             */
            clCreateImage3D: [types.Mem,
                [
                    types.Context,
                    types.MemFlags,
                    types.ImageFormatRef,
                    "size_t",
                    "size_t",
                    "size_t",
                    "size_t",
                    "size_t",
                    "pointer",
                    types.ErrorCodeRet
                ]
            ]
        });
}

CL11.types = types;

CL11.defs = defs;

CL11.prototype.checkError = function (err) {
    if (err) {
        if (_.isFunction(err.deref)) {
            err = err.deref();
        }
        if (err < 0) {
            throw new CLError(err);
        }
    }
};

module.exports = CL11;
