#!/bin/env bash
export EMSDK_QUIET=1
source "/opt/emsdk/emsdk_env.sh"

INCLUDES="-I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine"

# create the var directories, if doesn't exist
mkdir -p ./var/third-party

# build PGE and all pre-buildable extensions/utils
if [ ! -e ./var/third-party/olcPixelGameEngine.o ] ; then
    echo Building olcPixelGameEngine.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/olcPixelGameEngine.cpp -o ./var/third-party/olcPixelGameEngine.o
fi

if [ ! -e ./var/third-party/olcPGEX_Graphics2D.o ] ; then
    echo Building olcPGEX_Graphics2D.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_Graphics2D.cpp -o ./var/third-party/olcPGEX_Graphics2D.o
fi

if [ ! -e ./var/third-party/olcPGEX_Graphics3D.o ] ; then
    echo Building olcPGEX_Graphics3D.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_Graphics3D.cpp -o ./var/third-party/olcPGEX_Graphics3D.o
fi

if [ ! -e ./var/third-party/olcPGEX_PopUpMenu.o ] ; then
    echo Building olcPGEX_PopUpMenu.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_PopUpMenu.cpp -o ./var/third-party/olcPGEX_PopUpMenu.o
fi

if [ ! -e ./var/third-party/olcPGEX_QuickGUI.o ] ; then
    echo Building olcPGEX_QuickGUI.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_QuickGUI.cpp -o ./var/third-party/olcPGEX_QuickGUI.o
fi

if [ ! -e ./var/third-party/olcPGEX_RayCastWorld.o ] ; then
    echo Building olcPGEX_RayCastWorld.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_RayCastWorld.cpp -o ./var/third-party/olcPGEX_RayCastWorld.o
fi

if [ ! -e ./var/third-party/olcPGEX_Sound.o ] ; then
    echo Building olcPGEX_Sound.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_Sound.cpp -o ./var/third-party/olcPGEX_Sound.o
fi

if [ ! -e ./var/third-party/olcPGEX_SplashScreen.o ] ; then
    echo Building olcPGEX_SplashScreen.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_SplashScreen.cpp -o ./var/third-party/olcPGEX_SplashScreen.o
fi

if [ ! -e ./var/third-party/olcPGEX_TransformedView.o ] ; then
    echo Building olcPGEX_TransformedView.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_TransformedView.cpp -o ./var/third-party/olcPGEX_TransformedView.o
fi

if [ ! -e ./var/third-party/olcPGEX_Wireframe.o ] ; then
    echo Building olcPGEX_Wireframe.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcPixelGameEngine/extensions/olcPGEX_Wireframe.cpp -o ./var/third-party/olcPGEX_Wireframe.o
fi

# build SWE
if [ ! -e ./var/third-party/olcSoundWaveEngine.o ] ; then
    echo Building olcSoundWaveEngine.o
    em++ -c -std=c++20 $INCLUDES ./third-party/olcSoundWaveEngine/olcSoundWaveEngine.cpp -o ./var/third-party/olcSoundWaveEngine.o
fi
