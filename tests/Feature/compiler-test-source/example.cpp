#define OLC_PGE_APPLICATION
#include "olcPixelGameEngine.h"

#if defined(__EMSCRIPTEN__)
#include <emscripten.h>
#define FILE_RESOLVE(url, file) emscripten_wget(url, file); emscripten_sleep(0)
#else
#define FILE_RESOLVE(url, file)
#endif

// Override base class with your custom functionality
class Example : public olc::PixelGameEngine
{
public:
    Example()
    {
        // Name your application
        sAppName = "Example";
    }
    
public:
    bool OnUserCreate() override
    {
        // Called once at the start, so create things here
        
        // built with emscripten, maps the url to the virtual filesystem and makes it
        // available to the standard C/C++ file i/o functions without change!
        //
        // built with any other native toolchain, the macro does nothing and all file
        // access is done just as it would in any other normal scenario.
        FILE_RESOLVE("https://pit.pgetinker.com/MwpptUlwPhnc.png", "assets/gfx/broken.png");
        
        renBroken.Load("assets/gfx/broken.png");

        color = RandomColor();
        return true;
    }
    
    bool OnUserUpdate(float fElapsedTime) override
    {
        // Called once per frame, draws random coloured pixels
        if(GetMouse(0).bPressed)
            color = RandomColor();
        
        Clear(color);
        DrawRect(0,0,ScreenWidth()-1, ScreenHeight()-1, olc::YELLOW);
        DrawString(6,  6, "Hello, PGE", olc::BLACK);
        DrawString(5,  5, "Hello, PGE", olc::WHITE);
        DrawString(6, 26, "Mouse position SHOULD match\nclosely to the circle.\n\nYellow borders should ALWAYS\nbe visible\n\nLEFT MOUSE to change color.", olc::BLACK);
        DrawString(5, 25, "Mouse position SHOULD match\nclosely to the circle.\n\nYellow borders should ALWAYS\nbe visible\n\nLEFT MOUSE to change color.", olc::WHITE);
        
        DrawSprite(5, 100, renBroken.Sprite());

        DrawString(6, 221, GetMousePos().str(), olc::BLACK);
        DrawString(5, 220, GetMousePos().str(), olc::WHITE);
        FillCircle(GetMousePos(), 3, olc::RED);
        Draw(GetMousePos(), olc::WHITE);
        return true;
    }
    
    olc::Pixel RandomColor()
    {
        return olc::Pixel(rand() % 128, rand() % 128, rand() % 128);
    }
    
    olc::Pixel color;
    olc::Renderable renBroken;
};

int main()
{
    Example demo;
    if (demo.Construct(256, 240, 2, 2))
        demo.Start();
    return 0;
}