var util = require('util');
var _ = require('lodash');
var ref = require('ref');
var assert = require('assert');
var CLImage = require('./clImage');
var clUtils = require('./clUtils');

function CLImage2D(context, flags, format, width, height, hostPtr, rowPitch)
{
    hostPtr = hostPtr || null;
    rowPitch = rowPitch || width;
    var cl = context.cl;

    var err = ref.alloc(cl.types.ErrorCode);
    var handle = cl.imports.clCreateImage2D();

    /*// call "base constructor"
    cl_errcode res;
    sup = CLImage(clCreateImage2D(context.cptr, flags, &format, width, height, rowPitch, hostPtr, &res));

    mixin(exceptionHandling(
        ["CL_INVALID_CONTEXT",					""],
        ["CL_INVALID_VALUE",					"invalid image flags"],
        ["CL_INVALID_IMAGE_FORMAT_DESCRIPTOR",	"values specified in format are not valid or format is null"],
        ["CL_INVALID_IMAGE_SIZE",				"width or height are 0 OR exceed CL_DEVICE_IMAGE2D_MAX_WIDTH or CL_DEVICE_IMAGE2D_MAX_HEIGHT resp. OR rowPitch is not valid"],
        ["CL_INVALID_HOST_PTR",					"hostPtr is null and CL_MEM_USE_HOST_PTR or CL_MEM_COPY_HOST_PTR are set in flags or if hostPtr is not null but CL_MEM_COPY_HOST_PTR or CL_MEM_USE_HOST_PTR are not set in"],
        ["CL_IMAGE_FORMAT_NOT_SUPPORTED",		"format is not supported"],
        ["CL_MEM_OBJECT_ALLOCATION_FAILURE",	"couldn't allocate memory for image object"],
        ["CL_INVALID_OPERATION",				"there are no devices in context that support images (i.e. CL_DEVICE_IMAGE_SUPPORT is CL_FALSE)"],
        ["CL_OUT_OF_RESOURCES",					""],
        ["CL_OUT_OF_HOST_MEMORY",				""]
    ));*/
}