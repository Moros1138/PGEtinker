#!/bin/env bash
export EMSDK_QUIET=1
source "/opt/emsdk/emsdk_env.sh"

INCLUDES="-I./include/olcPixelGameEngine -I./include/olcPixelGameEngine/extensions -I./include/olcPixelGameEngine/utilities -I./include/olcSoundWaveEngine"

# create the var directories, if doesn't exist
mkdir -p lib

# build PGE and all pre-buildable extensions/utils
if [ ! -e ./lib/olcPixelGameEngine.o ] ; then
    echo Building olcPixelGameEngine.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/olcPixelGameEngine.cpp -o ./lib/olcPixelGameEngine.o
fi

if [ ! -e ./lib/olcPGEX_Graphics2D.o ] ; then
    echo Building olcPGEX_Graphics2D.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_Graphics2D.cpp -o ./lib/olcPGEX_Graphics2D.o
fi

if [ ! -e ./lib/olcPGEX_Graphics3D.o ] ; then
    echo Building olcPGEX_Graphics3D.o
    em++ -c -std=c++17 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_Graphics3D.cpp -o ./lib/olcPGEX_Graphics3D.o
fi

if [ ! -e ./lib/olcPGEX_PopUpMenu.o ] ; then
    echo Building olcPGEX_PopUpMenu.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_PopUpMenu.cpp -o ./lib/olcPGEX_PopUpMenu.o
fi

if [ ! -e ./lib/olcPGEX_QuickGUI.o ] ; then
    echo Building olcPGEX_QuickGUI.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_QuickGUI.cpp -o ./lib/olcPGEX_QuickGUI.o
fi

if [ ! -e ./lib/olcPGEX_RayCastWorld.o ] ; then
    echo Building olcPGEX_RayCastWorld.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_RayCastWorld.cpp -o ./lib/olcPGEX_RayCastWorld.o
fi

if [ ! -e ./lib/olcPGEX_Sound.o ] ; then
    echo Building olcPGEX_Sound.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_Sound.cpp -o ./lib/olcPGEX_Sound.o
fi

if [ ! -e ./lib/olcPGEX_SplashScreen.o ] ; then
    echo Building olcPGEX_SplashScreen.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_SplashScreen.cpp -o ./lib/olcPGEX_SplashScreen.o
fi

if [ ! -e ./lib/olcPGEX_TransformedView.o ] ; then
    echo Building olcPGEX_TransformedView.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_TransformedView.cpp -o ./lib/olcPGEX_TransformedView.o
fi

if [ ! -e ./lib/olcPGEX_Wireframe.o ] ; then
    echo Building olcPGEX_Wireframe.o
    em++ -c -std=c++20 $INCLUDES ./include/olcPixelGameEngine/extensions/olcPGEX_Wireframe.cpp -o ./lib/olcPGEX_Wireframe.o
fi

# build SWE
if [ ! -e ./lib/olcSoundWaveEngine.o ] ; then
    echo Building olcSoundWaveEngine.o
    em++ -c -std=c++20 $INCLUDES ./include/olcSoundWaveEngine/olcSoundWaveEngine.cpp -o ./lib/olcSoundWaveEngine.o
fi

echo Building Monoaco's model
cat include/olcPixelGameEngine/olcPixelGameEngine.h > model.h

cat include/olcPixelGameEngine/extensions/olcPGEX_Graphics2D.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_Graphics3D.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_Network.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_PopUpMenu.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_QuickGUI.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_RayCastWorld.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_Sound.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_SplashScreen.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_TransformedView.h >> model.h
cat include/olcPixelGameEngine/extensions/olcPGEX_Wireframe.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_Animate2D.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_Camera2D.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_Container.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_DataFile.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_Geometry2D.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_Palette.h >> model.h
cat include/olcPixelGameEngine/utilities/olcUTIL_QuadTree.h >> model.h
cat include/olcSoundWaveEngine/olcSoundWaveEngine.h >> model.h
