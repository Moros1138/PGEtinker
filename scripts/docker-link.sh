#!/usr/bin/bash

# 
# $1 = absolute path of the temporary working directory
# 
# ${@:2} = list of library objects to link in
# 

# cull the libraries from the CLI parameters
libraries=""

for i in ${@:2}; do
    if [ -e ./cache/third-party/$i ]; then
        libraries="$libraries /src/cache/third-party/$i"
    fi
done

# call the linker
docker run --rm \
    -v $1:/src/tmp \
    -v $(pwd)/cache/third-party:/src/cache/third-party \
    -v $(pwd)/emscripten_shell.html:/src/emscripten_shell.html \
    -v $(pwd)/cache/docker-emscripten:/emsdk/upstream/emscripten/cache \
    -u $(id -u):$(id -g) \
    pgetinker/builder \
    em++ \
    /src/tmp/pgetinker.o \
    $libraries \
    -o /src/tmp/pgetinker.html \
    --shell-file /src/emscripten_shell.html \
    -sASYNCIFY \
    -sALLOW_MEMORY_GROWTH=1 \
    -sMAX_WEBGL_VERSION=2 \
    -sMIN_WEBGL_VERSION=2 \
    -sUSE_LIBPNG=1 \
    -sUSE_SDL_MIXER=2 \
    -sLLD_REPORT_UNDEFINED \
    -sSINGLE_FILE
