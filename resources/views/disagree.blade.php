<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You disagreed | PGEtinker</title>
    <link rel="icon" type="text/svg" href="/favicon.svg">
    
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/normalize.scss')}}">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/disagreed.scss')}}">
    
    @vite("resources/js/disagreed.js")
</head>
<body>
    <div class="container">
        <h1>You disagreed!</h1>
        <p>
            I get it! You don't want to share any data with us and
            I respect that. Unfortunately that also means that you
            won't be able to use PGEtinker. This is sad, for me, but
            if you're still interested in the olcPixelGameEngine, or
            programming in C++, then this doesn't have to be the end
            of your journey.
        </p>
        <h2>Moving Forward.</h2>
        <p>
            I have made a few videos which give in depth instructions
            to get you on your feet writing C++ programs using the
            olcPixelGameEngine <b>on your machine</b>.
        </p>
        <p>
            If you have any questions or would like to talk with me,
            or some other amazing people, I invite you to join the
            amazing <a href="https://discord.gg/WhwHUMV" target="_blank">
            OneLoneCoder discord server</a>.
        </p>
        <p>
            I sincerely hope all of this helps you on your journey. Maybe I'll
            see you out there.
        </p>
        <p>-Moros1138</p>        
        <p>&nbsp;</p>
        <p>
            Check out this video here to learn how to install a toolchain for
            your OS!
        </p>
        <iframe src="https://www.youtube-nocookie.com/embed/Iw2-lb0ePmY"></iframe>
        <p>
            Check out this video here to learn how to install emscripten and
            build a PGE application for the web! (this is the same compiler system
            used by PGEtinker, btw)
        </p>
        <iframe src="https://www.youtube-nocookie.com/embed/1xFny-BkkR4"></iframe>
        


    </div>
    
    @include("shared.analytics")

</body>
</html>