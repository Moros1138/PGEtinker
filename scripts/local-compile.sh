#!/usr/bin/bash

# 
# $1 = path of the temporary working directory
# 
em++ \
    -O2 \
    -c \
    -I./third-party/olcPixelGameEngine \
    -I./third-party/olcPixelGameEngine/extensions \
    -I./third-party/olcPixelGameEngine/utilities \
    -I./third-party/olcSoundWaveEngine \
    $1/pgetinker.cpp -o $1/pgetinker.o
