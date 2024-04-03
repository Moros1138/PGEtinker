#!/usr/bin/bash

# 
# $1 = path of the temporary working directory
# 

docker run --rm \
    -v $1:/src/tmp \
    -v $(pwd)/third-party:/src/third-party \
    -v $(pwd)/cache/docker-emscripten:/emsdk/upstream/emscripten/cache \
    -u $(id -u):$(id -g) \
    pgetinker/builder \
    em++ \
    -c \
    -I/src/third-party/olcPixelGameEngine \
    -I/src/third-party/olcPixelGameEngine/extensions \
    -I/src/third-party/olcPixelGameEngine/utilities \
    -I/src/third-party/olcSoundWaveEngine \
    /src/tmp/pgetinker.cpp -o /src/tmp/pgetinker.o
