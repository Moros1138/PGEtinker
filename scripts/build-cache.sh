#!/bin/env bash

# create the cache directories, if doesn't exist
mkdir -p ./cache/{build,data,docker-emscripten,third-party}

# build PGE and all pre-buildable extensions/utils
if [ ! -e ./cache/third-party/olcPixelGameEngine.o ] ; then
    echo Building olcPixelGameEngine.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/olcPixelGameEngine.cpp -o ./cache/third-party/olcPixelGameEngine.o
fi

if [ ! -e ./cache/third-party/olcPGEX_Graphics2D.o ] ; then
    echo Building olcPGEX_Graphics2D.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_Graphics2D.cpp -o ./cache/third-party/olcPGEX_Graphics2D.o
fi

if [ ! -e ./cache/third-party/olcPGEX_Graphics3D.o ] ; then
    echo Building olcPGEX_Graphics3D.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_Graphics3D.cpp -o ./cache/third-party/olcPGEX_Graphics3D.o
fi

if [ ! -e ./cache/third-party/olcPGEX_PopUpMenu.o ] ; then
    echo Building olcPGEX_PopUpMenu.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_PopUpMenu.cpp -o ./cache/third-party/olcPGEX_PopUpMenu.o
fi

if [ ! -e ./cache/third-party/olcPGEX_QuickGUI.o ] ; then
    echo Building olcPGEX_QuickGUI.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_QuickGUI.cpp -o ./cache/third-party/olcPGEX_QuickGUI.o
fi

if [ ! -e ./cache/third-party/olcPGEX_RayCastWorld.o ] ; then
    echo Building olcPGEX_RayCastWorld.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_RayCastWorld.cpp -o ./cache/third-party/olcPGEX_RayCastWorld.o
fi

if [ ! -e ./cache/third-party/olcPGEX_Sound.o ] ; then
    echo Building olcPGEX_Sound.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_Sound.cpp -o ./cache/third-party/olcPGEX_Sound.o
fi

if [ ! -e ./cache/third-party/olcPGEX_SplashScreen.o ] ; then
    echo Building olcPGEX_SplashScreen.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_SplashScreen.cpp -o ./cache/third-party/olcPGEX_SplashScreen.o
fi

if [ ! -e ./cache/third-party/olcPGEX_TransformedView.o ] ; then
    echo Building olcPGEX_TransformedView.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_TransformedView.cpp -o ./cache/third-party/olcPGEX_TransformedView.o
fi

if [ ! -e ./cache/third-party/olcPGEX_Wireframe.o ] ; then
    echo Building olcPGEX_Wireframe.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcPixelGameEngine/extensions/olcPGEX_Wireframe.cpp -o ./cache/third-party/olcPGEX_Wireframe.o
fi

# build SWE
if [ ! -e ./cache/third-party/olcSoundWaveEngine.o ] ; then
    echo Building olcSoundWaveEngine.o
    em++ -c -std=c++20 -I./third-party/olcPixelGameEngine -I./third-party/olcPixelGameEngine/extensions -I./third-party/olcPixelGameEngine/utilities -I./third-party/olcSoundWaveEngine ./third-party/olcSoundWaveEngine/olcSoundWaveEngine.cpp -o ./cache/third-party/olcSoundWaveEngine.o
fi

echo Building pgetinker/builder docker image
docker build -t pgetinker/builder ./docker/
