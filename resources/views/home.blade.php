<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PGEtinker</title>
    <link rel="icon" type="text/svg" href="/favicon.svg">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/goldenlayout-base.scss')}}">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/goldenlayout-dark-theme.scss')}}" id="goldenlayout-dark-theme">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/goldenlayout-light-theme.scss')}}" id="goldenlayout-light-theme" disabled>
    
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/app.scss')}}">
    @vite('resources/js/app.js')

</head>
    <div id="app">
        <div id="header">
            <a href="/">
                <img src="/images/PGEtinker-logo.png" alt="PGEtinker Logo">
            </a>
            <div class="branding">
                <a href="https://github.com/OneLoneCoder/olcPixelGameEngine" target="_blank">
                    <img id="olc-brand" src="/images/pge-logo.png" alt="OneLoneCoder PixelGameEngine Logo">
                </a>
                <a href="https://emscripten.org/" target="_blank">
                    <img id="emscripten-brand" src="/images/emscripten-logo.png" alt="Emscripten Logo">
                </a>
            </div>
        </div>
        <div id="content">
            <noscript>
                <p>
                    It's cute that you think you're going to use a
                    webapp that relies so heavily on javascript...
                    ...without javascript.
                </p>
                <p>
                    If your browser is capable of using javascript yet you still
                    see this message, please consider using a real browser like
                    Firefox and Chromium (or Chromium forks).
                </p>
            </noscript>
        </div>
        <div id="footer">
            Haven't quite decided what should go here, probably a copyright notice or perhaps a whitty quote.
        </div>
    </div>
    <textarea id="code" style="display: none;">{{ $code }}</textarea>
</body>
</html>