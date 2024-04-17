#!/bin/env bash
export EMSDK_QUIET=1
source "/opt/emsdk/emsdk_env.sh"

echo "Building libraries"
embuilder build libpng sdl2_mixer

echo "Building v0.1 library objects"
(cd third_party/v0.01; bash build.sh)
