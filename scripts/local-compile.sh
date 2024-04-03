#!/usr/bin/bash
export EMSDK_QUIET=1
source "./third-party/emsdk/emsdk_env.sh"

# 
# $1 = path of the temporary working directory
# 
em++ \
    -c \
    -I./third-party/olcPixelGameEngine \
    -I./third-party/olcPixelGameEngine/extensions \
    -I./third-party/olcPixelGameEngine/utilities \
    -I./third-party/olcSoundWaveEngine \
    $1/pgetinker.cpp -o $1/pgetinker.o
