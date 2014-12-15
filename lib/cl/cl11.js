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
        clGetPlatformInfo: [ref.types.int, [types.PlatformId, types.PlatformInfo, ref.types.size_t, ref.refType('void'), ref.refType(ref.types.size_t)]],

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
        clGetDeviceInfo: [ref.types.int, [types.PlatformId, types.DeviceInfo, ref.types.size_t, ref.refType('void'), ref.refType(ref.types.size_t)]],

        /* Context APIs  */
        //extern CL_API_ENTRY cl_context CL_API_CALL
        //clCreateContext(const cl_context_properties * /* properties */,
        //                cl_uint                 /* num_devices */,
        //                const cl_device_id *    /* devices */,
        //                void (CL_CALLBACK * /* pfn_notify */)(const char *, const void *, size_t, void *),
        //                void *                  /* user_data */,
        //                cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateContext: [ref.refType('void'), [types.ContextProperties, ref.types.uint, ref.refType('void'), types.CreateContextNotify, ref.refType('void'), ref.refType(ref.types.int)]],

        //extern CL_API_ENTRY cl_context CL_API_CALL
        //clCreateContextFromType(const cl_context_properties * /* properties */,
        //                        cl_device_type          /* device_type */,
        //                        void (CL_CALLBACK *     /* pfn_notify*/ )(const char *, const void *, size_t, void *),
        //                        void *                  /* user_data */,
        //                        cl_int *                /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateContextFromType: [ref.refType('void'), [types.ContextProperties, types.DeviceType, types.CreateContextNotify, ref.refType('void'), ref.refType(ref.types.int)]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainContext(cl_context /* context */) CL_API_SUFFIX__VERSION_1_0;
        clRetainContext: ['int', [types.Context]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseContext(cl_context /* context */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseContext: ['int', [types.Context]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetContextInfo(cl_context         /* context */,
        //                 cl_context_info    /* param_name */,
        //                 size_t             /* param_value_size */,
        //                 void *             /* param_value */,
        //                 size_t *           /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetContextInfo: ['int', [types.Context, types.ContextInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Command Queue APIs */
        //extern CL_API_ENTRY cl_command_queue CL_API_CALL
        //clCreateCommandQueue(cl_context                     /* context */,
        //                     cl_device_id                   /* device */,
        //                     cl_command_queue_properties    /* properties */,
        //                     cl_int *                       /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateCommandQueue: [types.CommandQueue, [types.Context, types.DeviceId, types.CommandQueueProperties, ref.refType('int')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainCommandQueue(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
        clRetainCommandQueue: ['int', [types.CommandQueue]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseCommandQueue(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseCommandQueue: ['int', [types.CommandQueue]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetCommandQueueInfo(cl_command_queue      /* command_queue */,
        //                      cl_command_queue_info /* param_name */,
        //                      size_t                /* param_value_size */,
        //                      void *                /* param_value */,
        //                      size_t *              /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetCommandQueueInfo: ['int', [types.CommandQueue, types.CommandQueueInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Memory Object APIs */
        //extern CL_API_ENTRY cl_mem CL_API_CALL
        //clCreateBuffer(cl_context   /* context */,
        //               cl_mem_flags /* flags */,
        //               size_t       /* size */,
        //               void *       /* host_ptr */,
        //               cl_int *     /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateBuffer: [types.Mem, [types.Context, types.MemFlags, 'size_t', 'pointer', ref.refType('int')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainMemObject(cl_mem /* memobj */) CL_API_SUFFIX__VERSION_1_0;
        clRetainMemObject: ['int', [types.Mem]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseMemObject(cl_mem /* memobj */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseMemObject: ['int', [types.Mem]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetSupportedImageFormats(cl_context           /* context */,
        //                           cl_mem_flags         /* flags */,
        //                           cl_mem_object_type   /* image_type */,
        //                           cl_uint              /* num_entries */,
        //                           cl_image_format *    /* image_formats */,
        //                           cl_uint *            /* num_image_formats */) CL_API_SUFFIX__VERSION_1_0;
        clGetSupportedImageFormats: ['int', [types.Context, types.MemFlags, types.MemObjectType, 'uint', types.ImageFormatArray, ref.refType('uint')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetMemObjectInfo(cl_mem           /* memobj */,
        //                   cl_mem_info      /* param_name */,
        //                   size_t           /* param_value_size */,
        //                   void *           /* param_value */,
        //                   size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetMemObjectInfo: ['int', [types.Mem, types.MemInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetImageInfo(cl_mem           /* image */,
        //               cl_image_info    /* param_name */,
        //               size_t           /* param_value_size */,
        //               void *           /* param_value */,
        //               size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetImageInfo: ['int', [types.Mem, types.ImageInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Sampler APIs */
        //extern CL_API_ENTRY cl_sampler CL_API_CALL
        //clCreateSampler(cl_context          /* context */,
        //                cl_bool             /* normalized_coords */,
        //                cl_addressing_mode  /* addressing_mode */,
        //                cl_filter_mode      /* filter_mode */,
        //                cl_int *            /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateSampler: [types.Sampler, [types.Context, types.Bool, types.AddressingMode, types.FilterMode, ref.refType('int')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainSampler(cl_sampler /* sampler */) CL_API_SUFFIX__VERSION_1_0;
        clRetainSampler: ['int', [types.Sampler]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseSampler(cl_sampler /* sampler */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseSampler: ['int', [types.Sampler]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetSamplerInfo(cl_sampler         /* sampler */,
        //                 cl_sampler_info    /* param_name */,
        //                 size_t             /* param_value_size */,
        //                 void *             /* param_value */,
        //                 size_t *           /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetSamplerInfo: ['int', [types.Sampler, types.SamplerInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Program Object APIs  */
        //extern CL_API_ENTRY cl_program CL_API_CALL
        //clCreateProgramWithSource(cl_context        /* context */,
        //                          cl_uint           /* count */,
        //                          const char **     /* strings */,
        //                          const size_t *    /* lengths */,
        //                          cl_int *          /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateProgramWithSource: [types.Program, [types.Context, 'uint', ref.refType('string'), ref.refType('size_t'), ref.refType('int')]],

        //extern CL_API_ENTRY cl_program CL_API_CALL
        //clCreateProgramWithBinary(cl_context                     /* context */,
        //                          cl_uint                        /* num_devices */,
        //                          const cl_device_id *           /* device_list */,
        //                          const size_t *                 /* lengths */,
        //                          const unsigned char **         /* binaries */,
        //                          cl_int *                       /* binary_status */,
        //                          cl_int *                       /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateProgramWithBinary: [types.Program, [types.Context, 'uint', types.DeviceIdArray, ref.refType('size_t'), types.Binaries, ref.refType('int'), ref.refType('int')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainProgram(cl_program /* program */) CL_API_SUFFIX__VERSION_1_0;
        clRetainProgram: ['int', [types.Program]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseProgram(cl_program /* program */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseProgram: ['int', [types.Program]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clBuildProgram(cl_program           /* program */,
        //              cl_uint              /* num_devices */,
        //              const cl_device_id * /* device_list */,
        //              const char *         /* options */,
        //              void (CL_CALLBACK *  /* pfn_notify */)(cl_program /* program */, void * /* user_data */),
        //              void *               /* user_data */) CL_API_SUFFIX__VERSION_1_0;
        clBuildProgram: ['int', [types.Program, 'uint', types.DeviceIdArray, 'string', types.BuildProgramNotify, 'pointer']],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetProgramInfo(cl_program         /* program */,
        //                 cl_program_info    /* param_name */,
        //                 size_t             /* param_value_size */,
        //                 void *             /* param_value */,
        //                 size_t *           /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetProgramInfo: ['int', [types.Program, types.ProgramInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetProgramBuildInfo(cl_program            /* program */,
        //                      cl_device_id          /* device */,
        //                      cl_program_build_info /* param_name */,
        //                      size_t                /* param_value_size */,
        //                      void *                /* param_value */,
        //                      size_t *              /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetProgramBuildInfo: ['int', [types.Program, types.DeviceId, types.ProgramBuildInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Kernel Object APIs */
        //extern CL_API_ENTRY cl_kernel CL_API_CALL
        //clCreateKernel(cl_program      /* program */,
        //               const char *    /* kernel_name */,
        //               cl_int *        /* errcode_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateKernel: [types.Kernel, [types.Program, 'string', ref.refType('int')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clCreateKernelsInProgram(cl_program     /* program */,
        //                         cl_uint        /* num_kernels */,
        //                         cl_kernel *    /* kernels */,
        //                         cl_uint *      /* num_kernels_ret */) CL_API_SUFFIX__VERSION_1_0;
        clCreateKernelsInProgram: ['int', [types.Program, 'uint', types.KernelArray, ref.refType('uint')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainKernel(cl_kernel    /* kernel */) CL_API_SUFFIX__VERSION_1_0;
        clRetainKernel: ['int', [types.Kernel]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseKernel(cl_kernel   /* kernel */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseKernel: ['int', [types.Kernel]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clSetKernelArg(cl_kernel    /* kernel */,
        //               cl_uint      /* arg_index */,
        //               size_t       /* arg_size */,
        //               const void * /* arg_value */) CL_API_SUFFIX__VERSION_1_0;
        clSetKernelArg: ['int', [types.Kernel, 'uint', 'size_t', 'pointer']],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetKernelInfo(cl_kernel       /* kernel */,
        //                cl_kernel_info  /* param_name */,
        //                size_t          /* param_value_size */,
        //                void *          /* param_value */,
        //                size_t *        /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetKernelInfo: ['int', [types.Kernel, types.KernelInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetKernelWorkGroupInfo(cl_kernel                  /* kernel */,
        //                         cl_device_id               /* device */,
        //                         cl_kernel_work_group_info  /* param_name */,
        //                         size_t                     /* param_value_size */,
        //                         void *                     /* param_value */,
        //                         size_t *                   /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetKernelWorkGroupInfo: ['int', [types.Kernel, types.DeviceId, types.KernelWorkGroupInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Event Object APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clWaitForEvents(cl_uint             /* num_events */,
        //                const cl_event *    /* event_list */) CL_API_SUFFIX__VERSION_1_0;
        clWaitForEvents: ['int', ['uint', types.EventArray]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetEventInfo(cl_event         /* event */,
        //               cl_event_info    /* param_name */,
        //               size_t           /* param_value_size */,
        //               void *           /* param_value */,
        //               size_t *         /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        clGetEventInfo: ['int', [types.Event, types.EventInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clRetainEvent(cl_event /* event */) CL_API_SUFFIX__VERSION_1_0;
        clRetainEvent: ['int', [types.Event]],

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseEvent(cl_event /* event */) CL_API_SUFFIX__VERSION_1_0;
        clReleaseEvent: ['int', [types.Event]],

        /* Profiling APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clGetEventProfilingInfo(cl_event            /* event */,
        //                        cl_profiling_info   /* param_name */,
        //                        size_t              /* param_value_size */,
        //                        void *              /* param_value */,
        //                        size_t *            /* param_value_size_ret */) CL_API_SUFFIX__VERSION_1_0;
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clReleaseEvent(cl_event /* event */) CL_API_SUFFIX__VERSION_1_0;
        clGetEventProfilingInfo: ['int', [types.Event, types.ProfilingInfo, 'size_t', 'pointer', ref.refType('size_t')]],

        /* Flush and Finish APIs */
        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clFlush(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
        clFlush: bridjs.defineFunction('int', 'pointer').bind("clFlush"),

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clFinish(cl_command_queue /* command_queue */) CL_API_SUFFIX__VERSION_1_0;
        clFinish: bridjs.defineFunction('int', 'pointer').bind("clFinish"),

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
        clEnqueueReadBuffer: bridjs.defineFunction('int', 'pointer', types.Mem, types.Bool,
            'size_t', 'size_t', 'pointer', 'uint', 'pointer', 'pointer').bind("clEnqueueReadBuffer"),

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
        clEnqueueWriteBuffer: bridjs.defineFunction('int', 'pointer', types.Mem, types.Bool,
            'size_t', 'size_t', 'pointer', 'uint', 'pointer', 'pointer').bind("clEnqueueWriteBuffer"),

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
        clEnqueueCopyBuffer: bridjs.defineFunction('int', 'pointer', types.Mem, types.Mem,
            'size_t', 'size_t', 'size_t', 'uint', 'pointer', 'pointer').bind("clEnqueueCopyBuffer"),

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
        clEnqueueReadImage: bridjs.defineFunction('int', 'pointer', types.Mem, types.Bool,
            'pointer', 'pointer', 'size_t', 'size_t', 'pointer', 'uint', 'pointer', 'pointer').bind("clEnqueueReadImage"),

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
        clEnqueueWriteImage: bridjs.defineFunction('int', 'pointer', types.Mem, types.Bool,
            'pointer', 'pointer', 'size_t', 'size_t', 'pointer', 'uint', 'pointer', 'pointer').bind("clEnqueueWriteImage"),

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
        clEnqueueCopyImage: bridjs.defineFunction('int', 'pointer', types.Mem, types.Mem,
            'pointer', 'pointer', 'pointer', 'uint', 'pointer', 'pointer').bind("clEnqueueCopyImage"),

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
        clEnqueueCopyImageToBuffer: bridjs.defineFunction('int', 'pointer', types.Mem, types.Mem,
            'pointer', 'pointer', 'size_t', 'uint', 'pointer', 'pointer').bind("clEnqueueCopyImageToBuffer"),

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
        clEnqueueCopyBufferToImage: bridjs.defineFunction('int', 'pointer', types.Mem, types.Mem, 'size_t',
            'pointer', 'pointer', 'uint', 'pointer', 'pointer').bind("clEnqueueCopyBufferToImage"),

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
        clEnqueueMapBuffer: bridjs.defineFunction('pointer', 'pointer', types.Mem, types.Bool,
            Type.mapFlags, 'size_t', 'size_t', 'uint', 'pointer', 'pointer', ref.refType('int')).bind("clEnqueueMapBuffer"),

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
        clEnqueueMapImage: bridjs.defineFunction('pointer', 'pointer', types.Mem, types.Bool,
            Type.mapFlags, ref.refType('size_t'), ref.refType('size_t'), ref.refType('size_t'), ref.refType('size_t'),
            'uint', 'pointer', 'pointer', ref.refType('int')).bind("clEnqueueMapImage"),

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clEnqueueUnmapMemObject(cl_command_queue /* command_queue */,
        //                        cl_mem           /* memobj */,
        //                        void *           /* mapped_ptr */,
        //                        cl_uint          /* num_events_in_wait_list */,
        //                        const cl_event *  /* event_wait_list */,
        //                        cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_0;
        clEnqueueUnmapMemObject: bridjs.defineFunction('int', 'pointer', types.Mem, 'pointer',
            'uint', 'pointer', 'pointer').bind("clEnqueueUnmapMemObject"),

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
        clEnqueueNDRangeKernel: bridjs.defineFunction('int', 'pointer', 'pointer',
            'uint', ref.refType('size_t'), ref.refType('size_t'), ref.refType('size_t'),
            'uint',
            'pointer', 'pointer').bind("clEnqueueNDRangeKernel"),

        //extern CL_API_ENTRY cl_int CL_API_CALL
        //clEnqueueTask(cl_command_queue  /* command_queue */,
        //              cl_kernel         /* kernel */,
        //              cl_uint           /* num_events_in_wait_list */,
        //              const cl_event *  /* event_wait_list */,
        //              cl_event *        /* event */) CL_API_SUFFIX__VERSION_1_0;
        clEnqueueTask: bridjs.defineFunction('int', 'pointer', 'pointer',
            'uint', bridjs.byPointer(bridjs.NativeValue.pointer), bridjs.byPointer(bridjs.NativeValue.pointer)).bind("clEnqueueTask"),

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
        clEnqueueNativeKernel: bridjs.defineFunction('int', 'pointer', 'pointer', bridjs.byPointer(Type.enqueueNativeKernelUserFunc),
            'pointer', 'size_t', 'uint', types.Mem, bridjs.byPointer(bridjs.NativeValue.pointer), 'uint', bridjs.byPointer(bridjs.NativeValue.pointer),
            bridjs.byPointer(bridjs.NativeValue.pointer)).bind("clEnqueueNativeKernel")
    });

function CL11() {
    this.types = types;
    this.defs = defs;
    this.version = 1.1;
}

CL11.types = types;

CL11.defs = defs;

CL11.prototype.checkError = function (err) {
    if (err) {
        throw new Error('OpenCL error. Code: ' + err);
    }
};

clHelpers.importFunctions(CL11.prototype, lib11);

module.exports = CL11;
