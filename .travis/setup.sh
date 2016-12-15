#!/bin/bash

if [[ $TRAVIS_OS_NAME == 'linux' ]]; then

    # Install some custom requirements on Linux
    echo "Setting up Ubuntu OpenCL Prerequisites"

    # apt-get setup and toolset installation
    sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test
    sudo apt-get update -qq -y
    sudo apt-get install -qq mesa-common-dev alien libnuma1 opencl-headers

    # download and unpack base opencl Intel drivers
    wget http://registrationcenter.intel.com/irc_nas/4181/opencl_runtime_14.2_x64_4.5.0.8.tgz
    tar -xvf opencl_runtime_14.2_x64_4.5.0.8.tgz

    # convert opencl drivers from rpm to deb package and install
    cd pset_opencl_runtime_14.1_x64_4.5.0.8/rpm
    for f in *.rpm; do
        fakeroot alien --to-deb $f
    done
    for f in *.deb; do
        sudo dpkg -i $f
    done

    # link drivers
    sudo mkdir /etc/OpenCL
    sudo mkdir /etc/OpenCL/vendors
    sudo ln -s /opt/intel/opencl-1.2-4.5.0.8/etc/intel64.icd /etc/OpenCL/vendors/intel64.icd
    sudo ln -s /opt/intel/opencl-1.2-4.5.0.8/lib64/libOpenCL.so /usr/lib/libOpenCL.so
    sudo ln -s /opt/intel/opencl-1.2-4.5.0.8/lib64/libOpenCL.so.1 /usr/lib/libOpenCL.so.1
    sudo ldconfig

    # wrap up
    cd ../..
else

    # Install some custom requirements on OS X
    echo "No OSX OpenCL Prerequisites"
fi
