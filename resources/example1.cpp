#define OLC_PGE_APPLICATION
#include "olcPixelGameEngine.h"

#if defined(__EMSCRIPTEN__)
#include <emscripten.h>
#endif

// EMSCRIPTEN ONLY!
// 
// At runtime, this function attempts to load a file
// from the provided URL, and maps it to emscripten's
// filesystem. You can then use the file in any C/C++
// filesystem function as if it were on the local disk.
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
        sAppName = "PGEtinker Classic Example";
    }
    
public:

    // OnUserCreate is Called once at the start and
    // is where you do things like load files and
    // initilize variables.
    bool OnUserCreate() override
    {
        // load "assets/gfx/broken.png" from a URL
        FILE_RESOLVE("https://pit.pgetinker.com/MwpptUlwPhnc.png", "assets/gfx/broken.png");
        
        renImageFromUrl.Load("assets/gfx/broken.png");

        color = RandomColor();
        return true;
    }
    
    // OnUserUpdate is called once per frame and
    // is where you draw things to the screen
    bool OnUserUpdate(float fElapsedTime) override
    {
        // when you left click the mouse
        if(GetMouse(0).bPressed)
        {
            // change the color
            color = RandomColor();
            
            // print out the current mouse position (x, y)
            std::cout << GetMousePos() << "\n";
        }
            
        // clear the screen to the provided color
        Clear(color);

        // Draw the yellow outline
        DrawRect(0,0,ScreenWidth()-1, ScreenHeight()-1, olc::YELLOW);
        
        // draw some test
        DrawStringDropShadow(5,  5, "Hello, PGE", olc::WHITE, olc::BLACK);
        DrawStringDropShadow(5, 25, "Mouse position SHOULD match\nclosely to the circle.\n\nYellow borders should ALWAYS\nbe visible\n\nLEFT MOUSE to change color.", olc::WHITE, olc::BLACK);
        DrawStringDropShadow(5, 220, GetMousePos().str(), olc::WHITE, olc::BLACK);
        
        // draw the loaded sprite
        DrawSprite(5, 100, renImageFromUrl.Sprite());

        // draw a circle where the mouse is currently located
        FillCircle(GetMousePos(), 3, olc::RED);
        
        // draw a point where the mouse is currently located
        Draw(GetMousePos(), olc::WHITE);
        
        return true;
    }
    
    void DrawStringDropShadow(const int x, const int y, const std::string& text, const olc::Pixel& foregroundColor, const olc::Pixel& backgroundColor)
    {
        DrawString(x + 1, y + 1, text, backgroundColor);
        DrawString(    x,     y, text, foregroundColor);
    }
    
    olc::Pixel RandomColor()
    {
        // we limit to the darker half of the colors
        return olc::Pixel(rand() % 128, rand() % 128, rand() % 128);
    }
    
public: // class variables
    
    // this is the color that is changed every mouse click
    olc::Pixel color;
    
    // this is the sprite that is loaded from a URL
    olc::Renderable renImageFromUrl;
};

int main()
{
    // an instance of the Example, called demo
    Example demo;
    
    // attempt to construct the window/screen 256x240 pixels,
    // with pixels that are 2x2. If successful, start
    // the demo.
    if (demo.Construct(256, 240, 2, 2))
        demo.Start();
    
    // this is the end of the program
    return 0;
}