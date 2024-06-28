#define OLC_PGE_APPLICATION
#include "olcPixelGameEngine.h"

#if defined(__EMSCRIPTEN__)
#include <emscripten.h>
#endif

void FILE_RESOLVE(const char* url, const char* file)
{
    #if defined(__EMSCRIPTEN__)
    emscripten_wget(url, file);
    emscripten_sleep(0);
    #endif
}

// Override base class with your custom functionality
class Example : public olc::PixelGameEngine
{
public:
    Example()
    {
        // Name your application
        sAppName = "Bare PGE";
    }
    
public:
    bool OnUserCreate() override
    {
        // Called once at the start, so create things here
        return true;
    }
    
    bool OnUserUpdate(float fElapsedTime) override
    {
        // Called once per frame, draws random coloured pixels
        return true;
    }
};

int main()
{
    Example demo;
    if (demo.Construct(256, 240, 2, 2))
        demo.Start();
    return 0;
}