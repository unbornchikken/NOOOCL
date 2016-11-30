/*
 License: [MIT](../LICENSE)

 Copyright (c) 2014 Gábor Mező aka [unbornchikken](https://github.com/unbornchikken)
 */

/*
 # types object

 Required ref types for communicating with the OpenCL C API.

 **base:** Object
 */

"use strict";

var fastcall = require("fastcall");
var ref = fastcall.ref;
var ffi = fastcall.ffi;
var StructType = fastcall.StructType;
var ArrayType = fastcall.ArrayType;

var ImageFormat = new StructType({
    imageChannelOrder: "uint",
    imageChannelDataType: "uint"
});

var ImageDesc = new StructType({
    // _imageType_
    // - CL_MEM_OBJECT_BUFFER
    // - CL_MEM_OBJECT_IMAGE2D
    // - CL_MEM_OBJECT_IMAGE3D
    imageType: "uint",
    imageWidth: "size_t",
    imageHeight: "size_t",
    imageDepth: "size_t",
    imageArraySize: "size_t",
    imageRowPitch: "size_t",
    imageSlicePitch: "size_t",
    numMipLevels: "uint",
    numSamples: "uint",
    buffer: ref.refType("void")
});

var BufferRegion = new StructType({
    origin: "size_t",
    size: "size_t"
});

var types = {
    ImageFormat: ImageFormat,
    ImageFormatArray: new ArrayType(ImageFormat),
    ImageFormatRef: ref.refType(ImageFormat),
    ImageDesc: ImageDesc,
    ImageDescRef: ref.refType(ImageDesc),
    BufferRegion: BufferRegion,
    Bool: ref.types.uint,
    SizeTArray: new ArrayType("size_t"),
    StringArray: new ArrayType("string"),
    ErrorCode: ref.types.int,
    ErrorCodeRet: ref.refType("int"),
    Bitfield: ref.types.uint64,
    DeviceType: ref.types.uint64,
    PlatformInfo: ref.types.uint,
    DeviceInfo: ref.types.uint,
    DeviceFpConfig: ref.types.uint64,
    DeviceMemCacheType: ref.types.uint,
    DeviceLocalMemType: ref.types.uint,
    DeviceExecCapabilities: ref.types.uint64,
    CommandQueueProperties: ref.types.uint64,
    DevicePartitionProperties: new ArrayType("int"),
    DeviceAffinityDomain: ref.types.uint64,
    ContextProperties: new ArrayType("size_t"),
    ContextInfo: ref.types.uint,
    CommandQueueInfo: ref.types.uint,
    ChannelOrder: ref.types.uint,
    ChannelType: ref.types.uint,
    MemFlags: ref.types.uint64,
    MemObjectType: ref.types.uint,
    MemInfo: ref.types.uint,
    MemMigrationFlags: ref.types.uint64,
    ImageInfo: ref.types.uint,
    BufferCreateType: ref.types.uint,
    AddressingMode: ref.types.uint,
    FilterMode: ref.types.uint,
    SamplerInfo: ref.types.uint,
    MapFlags: ref.types.uint64,
    ProgramInfo: ref.types.uint,
    ProgramBuildInfo: ref.types.uint,
    ProgramBinaryType: ref.types.uint,
    BuildStatus: ref.types.int,
    KernelInfo: ref.types.uint,
    KernelArgInfo: ref.types.uint,
    KernelArgAddressQualifier: ref.types.uint,
    KernelArgAccessQualifier: ref.types.uint,
    KernelArgTypeQualifier: ref.types.uint64,
    KernelWorkGroupInfo: ref.types.uint,
    EventInfo: ref.types.uint,
    CommandType: ref.types.uint,
    CommandExecutionStatus: ref.types.uint,
    ProfilingInfo: ref.types.uint,
    Mem: ref.refType("void"),
    MemArray: new ArrayType(ref.refType("void")),
    PlatformId: ref.refType("void"),
    PlatformIdArray: new ArrayType(ref.refType("void")),
    DeviceId: ref.refType("void"),
    DeviceIdArray: new ArrayType(ref.refType("void")),
    CommandQueue: ref.refType("void"),
    Context: ref.refType("void"),
    Sampler: ref.refType("void"),
    Program: ref.refType("void"),
    ProgramArray: new ArrayType(ref.refType("void")),
    Kernel: ref.refType("void"),
    KernelArray: new ArrayType(ref.refType("void")),
    Event: ref.refType("void"),
    EventRef: ref.refType(ref.refType("void")),
    EventArray: new ArrayType(ref.refType("void")),
    Binary: new ArrayType("byte"),
    Binaries: new ArrayType(ref.refType("void")),
    CreateContextNotify: ffi.Function("void", [ "pointer", "pointer" ]),
    BuildProgramNotify: ffi.Function("void", [ "pointer", "pointer" ]),
    EnqueueNativeKernelUserFunc: ffi.Function("void", [ "pointer" ]),
    SetEventCallbackCallback: ffi.Function("void", [ "pointer", "int", "pointer" ]),
    MemObjectDestructorCallback: ffi.Function("void", [ "pointer", "pointer" ])
};

module.exports = types;
