var ref = require('ref');
var Struct = require('ref-struct');
var ArrayType = require('ref-array');
var ffi = require('ffi');

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
    ImageDesc: ImageDesc,
    BufferRegion: BufferRegion,
    bool: ref.types.bool, /* WARNING!  Unlike cl_ types in cl_platform.h, cl_bool is not guaranteed to be the same size as the bool in kernels. */
    bitfield: ref.types.uint64, //typedef cl_ulong            cl_bitfield;
    deviceType: ref.types.uint64,//typedef cl_bitfield         cl_device_type;
    platformInfo: ref.types.uint,//typedef cl_uint             cl_platform_info;
    deviceInfo: ref.types.uint,//typedef cl_uint             cl_device_info;
    deviceFpConfig: ref.types.uint64,//typedef cl_bitfield         cl_device_fp_config;
    deviceMemCacheType: ref.types.uint,//typedef cl_uint             cl_device_mem_cache_type;
    deviceLocalMemType: ref.types.uint,//typedef cl_uint             cl_device_local_mem_type;
    deviceExecCapabilities: ref.types.uint64,//typedef cl_bitfield         cl_device_exec_capabilities;
    commandQueueProperties: ref.types.uint64,//typedef cl_bitfield         cl_command_queue_properties;
    devicePartitionProperty: ref.refType('void'),//typedef intptr_t            cl_device_partition_property;
    deviceAffinityDomain: ref.types.uint64,//typedef cl_bitfield         cl_device_affinity_domain;
    contextProperties: ref.refType('void'),//typedef intptr_t            cl_context_properties;
    contextInfo: ref.types.uint,//typedef cl_uint             cl_context_info;
    commandQueueInfo: ref.types.uint,//typedef cl_uint             cl_command_queue_info;
    channelOrder: ref.types.uint,//typedef cl_uint             cl_channel_order;
    channelType: ref.types.uint,//typedef cl_uint             cl_channel_type;
    memFlags: ref.types.uint64,//typedef cl_bitfield         cl_mem_flags;
    memObjectType: ref.types.uint,//typedef cl_uint             cl_mem_object_type;
    memInfo: ref.types.uint,//typedef cl_uint             cl_mem_object_type;
    memMigrationFlags: ref.types.uint64,//typedef cl_bitfield         cl_mem_migration_flags;
    imagInfo: ref.types.uint, //typedef cl_uint             cl_image_info;
    bufferCreateType: ref.types.uint, //typedef cl_uint             cl_buffer_create_type;
    addressingMode: ref.types.uint, //typedef cl_uint             cl_addressing_mode;
    filterMode: ref.types.uint,// typedef cl_uint             cl_filter_mode;
    samplerInfo: ref.types.uint,//typedef cl_uint             cl_sampler_info;
    mapFlags: ref.types.uint64,//typedef cl_bitfield         cl_map_flags;
    programInfo: ref.types.uint,//typedef cl_uint             cl_program_info;
    programBuildInfo: ref.types.uint,//typedef cl_uint             cl_program5_build_info;
    programBinaryType: ref.types.uint,//typedef cl_uint             cl_program_binary_type;
    buildStatus: ref.types.int,//typedef cl_uint             cl_program_binary_type;
    kernelInfo: ref.types.uint,//typedef cl_int              cl_build_status;
    kernelArgInfo: ref.types.uint,//typedef cl_uint             cl_kernel_arg_info;
    kernelArgAddressQualifier: ref.types.uint,//typedef cl_uint             cl_kernel_arg_address_qualifier;
    kernelArgAccessQualifier: ref.types.uint,//typedef cl_uint             cl_kernel_arg_access_qualifier;
    kernelArgTypeQualifier: ref.types.uint64,//typedef cl_bitfield         cl_kernel_arg_type_qualifier;
    kernelWorkGroupInfo: ref.types.uint,//typedef cl_uint             cl_kernel_work_group_info;
    eventInfo: ref.types.uint,//typedef cl_uint             cl_event_info;
    commandType: ref.types.uint,//typedef cl_uint             cl_command_type;
    profilingInfo: ref.types.uint,//typedef cl_uint             cl_profiling_info;
    mem: ref.refType('void'),
    platformId: ref.refType('void'),
    PlatformIdArray: ArrayType(ref.refType('void')),
    deviceId: ref.refType('void'),
    DeviceIdArray: ArrayType(ref.refType('void')),
    commandQueue: ref.refType('void'),
    context: ref.refType('void'),
    createContextNotify: ffi.Function("void", ["pointer", "pointer"]),
    buildProgramNotify: ffi.Function("void", ["pointer", "pointer"]),
    enqueueNativeKernelUserFunc: ffi.Function("void", ["pointer"]),
    setEventCallbackCallback: ffi.Function("void", ["int", "pointer"])
};

module.exports = types;
