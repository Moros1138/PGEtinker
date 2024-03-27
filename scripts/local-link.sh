#!/usr/bin/bash
export EMSDK_QUIET=1
source "./third-party/emsdk/emsdk_env.sh"

# 
# $1 = absolute path of the temporary working directory
# 
# ${@:2} = list of library objects to link in
# 

# cull the libraries from the CLI parameters
libraries=""

for i in ${@:2}; do
    if [ -e ./cache/third-party/$i ]; then
        libraries="$libraries ./cache/third-party/$i"
    fi
done

# call the linker
em++ \
    -O2 \
    $1/pgetinker.o \
    $libraries \
    -o $1/pgetinker.html \
    --shell-file ./emscripten_shell.html \
    -sASYNCIFY \
    -sALLOW_MEMORY_GROWTH=1 \
    -sMAX_WEBGL_VERSION=2 \
    -sMIN_WEBGL_VERSION=2 \
    -sUSE_LIBPNG=1 \
    -sUSE_SDL_MIXER=2 \
    -sLLD_REPORT_UNDEFINED \
    -sSINGLE_FILE
