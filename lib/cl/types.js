var ref = require('ref');
var Struct = require('ref-struct');
var ArrayType = require('ref-array');
var ffi = require('ffi');
var Buffer = require('buffer');
var _ = require('lodash');

var ImageFormat = Struct({
    imageChannelOrder: 'uint',
    imageChannelDataType: 'uint'
});

var ImageDesc = Struct({
    imageType: 'uint', //cl_mem_object_type      image_type;
    imageWidth: 'size_t', //size_t                  image_width;
    imageHeight: 'size_t', //size_t                  image_height;
    imageDepth: 'size_t', //size_t                  image_depth;
    imageArraySize: 'size_t', //size_t                  image_array_size;
    imageRowPitch: 'size_t', //size_t                  image_row_pitch;
    imageSlicePitch: 'size_t', //size_t                  image_slice_pitch;
    numMipLevels: 'uint', //cl_uint                 num_mip_levels;
    numSamples: 'uint', //cl_uint                 num_samples;
    buffer: 'pointer' //cl_mem                  buffer;
});

var BufferRegion = Struct({
    origin: 'size_t', //size_t                  origin;
    size: 'size_t' //size_t                  size;
});// cl_buffer_region;

var types = {
    ImageFormat: ImageFormat,
    ImageFormatArray: new ArrayType(ImageFormat),
    ImageFormatRef: ref.refType(ImageFormat),
    ImageDesc: ImageDesc,
    ImageDescRef: ref.refType(ImageDesc),
    BufferRegion: BufferRegion,
    Bool: ref.types.uint, /* WARNING!  Unlike cl_ types in cl_platform.h, cl_bool is not guaranteed to be the same size as the Bool in kernels. */
    SizeTArray: ArrayType('size_t'),
    StringArray: ArrayType('string'),
    ErrorCode: ref.types.int,
    ErrorCodeRet: ref.refType('int'),
    Bitfield: ref.types.uint64, //typedef cl_ulong            cl_bitfield;
    DeviceType: ref.types.uint64,//typedef cl_bitfield         cl_device_type;
    PlatformInfo: ref.types.uint,//typedef cl_uint             cl_platform_info;
    DeviceInfo: ref.types.uint,//typedef cl_uint             cl_device_info;
    DeviceFpConfig: ref.types.uint64,//typedef cl_bitfield         cl_device_fp_config;
    DeviceMemCacheType: ref.types.uint,//typedef cl_uint             cl_device_mem_cache_type;
    DeviceLocalMemType: ref.types.uint,//typedef cl_uint             cl_device_local_mem_type;
    DeviceExecCapabilities: ref.types.uint64,//typedef cl_bitfield         cl_device_exec_capabilities;
    CommandQueueProperties: ref.types.uint64,//typedef cl_bitfield         cl_command_queue_properties;
    DevicePartitionProperties: ArrayType('int'),//typedef intptr_t            cl_device_partition_property;
    DeviceAffinityDomain: ref.types.uint64,//typedef cl_bitfield         cl_device_affinity_domain;
    ContextProperties: ArrayType('size_t'),//typedef intptr_t            cl_context_properties;
    ContextInfo: ref.types.uint,//typedef cl_uint             cl_context_info;
    CommandQueueInfo: ref.types.uint,//typedef cl_uint             cl_command_queue_info;
    ChannelOrder: ref.types.uint,//typedef cl_uint             cl_channel_order;
    ChannelType: ref.types.uint,//typedef cl_uint             cl_channel_type;
    MemFlags: ref.types.uint64,//typedef cl_bitfield         cl_mem_flags;
    MemObjectType: ref.types.uint,//typedef cl_uint             cl_mem_object_type;
    MemInfo: ref.types.uint,//typedef cl_uint             cl_mem_object_type;
    MemMigrationFlags: ref.types.uint64,//typedef cl_bitfield         cl_mem_migration_flags;
    ImageInfo: ref.types.uint, //typedef cl_uint             cl_image_info;
    BufferCreateType: ref.types.uint, //typedef cl_uint             cl_buffer_create_type;
    AddressingMode: ref.types.uint, //typedef cl_uint             cl_addressing_mode;
    FilterMode: ref.types.uint,// typedef cl_uint             cl_filter_mode;
    SamplerInfo: ref.types.uint,//typedef cl_uint             cl_sampler_info;
    MapFlags: ref.types.uint64,//typedef cl_bitfield         cl_map_flags;
    ProgramInfo: ref.types.uint,//typedef cl_uint             cl_program_info;
    ProgramBuildInfo: ref.types.uint,//typedef cl_uint             cl_program_build_info;
    ProgramBinaryType: ref.types.uint,//typedef cl_uint             cl_program_binary_type;
    BuildStatus: ref.types.int,//typedef cl_uint             cl_program_binary_type;
    KernelInfo: ref.types.uint,//typedef cl_int              cl_build_status;
    KernelArgInfo: ref.types.uint,//typedef cl_uint             cl_kernel_arg_info;
    KernelArgAddressQualifier: ref.types.uint,//typedef cl_uint             cl_kernel_arg_address_qualifier;
    KernelArgAccessQualifier: ref.types.uint,//typedef cl_uint             cl_kernel_arg_access_qualifier;
    KernelArgTypeQualifier: ref.types.uint64,//typedef cl_bitfield         cl_kernel_arg_type_qualifier;
    KernelWorkGroupInfo: ref.types.uint,//typedef cl_uint             cl_kernel_work_group_info;
    EventInfo: ref.types.uint,//typedef cl_uint             cl_event_info;
    CommandType: ref.types.uint,//typedef cl_uint             cl_command_type;
    CommandExecutionStatus: ref.types.uint, // cl_command_execution_status
    ProfilingInfo: ref.types.uint,//typedef cl_uint             cl_profiling_info;
    Mem: ref.refType('void'),
    MemArray: ArrayType(ref.refType('void')),
    PlatformId: ref.refType('void'),
    PlatformIdArray: ArrayType(ref.refType('void')),
    DeviceId: ref.refType('void'),
    DeviceIdArray: ArrayType(ref.refType('void')),
    CommandQueue: ref.refType('void'),
    Context: ref.refType('void'),
    Sampler: ref.refType('void'),
    Program: ref.refType('void'),
    ProgramArray: ArrayType(ref.refType('void')),
    Kernel: ref.refType('void'),
    KernelArray: ArrayType(ref.refType('void')),
    Event: ref.refType('void'),
    EventRef: ref.refType(ref.refType('void')),
    EventArray: ArrayType(ref.refType('void')),
    Binary: ArrayType('byte'),
    Binaries: ArrayType(ref.refType('void')),
    CreateContextNotify: ffi.Function('void', ['pointer', 'pointer']),
    BuildProgramNotify: ffi.Function('void', ['pointer', 'pointer']),
    EnqueueNativeKernelUserFunc: ffi.Function('void', ['pointer']),
    SetEventCallbackCallback: ffi.Function('void', ['pointer', 'int', 'pointer']),
    MemObjectDestructorCallback: ffi.Function('void', ['pointer', 'pointer'])
};

types.utils = {
    createDeviceArray: function(devices) {
        if (!_.isArray(devices)) devices = [devices];
        var deviceArray = new (types.DeviceIdArray)(devices.length);
        for (var i = 0; i < devices.length; i++) {
            deviceArray[i] = devices[i].handle;
        }
        return deviceArray;
    }
}

module.exports = types;
