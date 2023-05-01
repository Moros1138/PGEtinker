#!/bin/env bash
export EMSDK_QUIET=1
source /home/jon/opt/emsdk/emsdk_env.sh

if [ ! -d ./cache/build ] ; then
    mkdir -p ./cache/build
fi

TMPDIR=./cache/build/
mydir=$(mktemp -d "${TMPDIR:-/tmp/}pgetinker.XXXXXXXXXXXX")

while read line
do
  echo "$line" >> "$mydir/pgetinker.cpp"
done

prebuilt_objects=""
# cycle through the CLI arguments and see which, if any, of them are
# prebuilt objects in order
for i in "$@"; do
    if [ -e "./cache/third-party/$i" ] ; then
        prebuilt_objects="$prebuilt_objects ./cache/third-party/$i"
    fi
done

    # link
em++ \
    -c \
    "$mydir/pgetinker.cpp" \
    -o \
    "$mydir/pgetinker.o" \
    && \
em++ \
    "$mydir/pgetinker.o" \
    $prebuilt_objects \
    -o "$mydir/pgetinker.html" \
    -sASYNCIFY \
    -sALLOW_MEMORY_GROWTH=1 \
    -sMAX_WEBGL_VERSION=2 \
    -sMIN_WEBGL_VERSION=2 \
    -sUSE_LIBPNG=1 \
    -sUSE_SDL_MIXER=2 \
    -sLLD_REPORT_UNDEFINED

if [ -e "$mydir/pgetinker.html" ]; then
    cat "$mydir/pgetinker.html"
    exit 0
fi
    
exit 1
    
