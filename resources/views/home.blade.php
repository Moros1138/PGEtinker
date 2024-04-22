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
        <nav id="header">
            <a class="brand" href="/">
                <img src="/images/PGEtinker-logo.png" alt="PGEtinker Logo">
            </a>
            <div class="navbar-left-menu">
                <div class="dropdown">
                    <div class="menu-item">Settings</div>
                    <div class="dropdown-content">
                        <a href="#" id="default-code">Default Code</a>
                        <a href="#" id="toggle-theme">Toggle Theme</a>
                        <a href="#" id="default-layout">Restore Default Layout</a>
                        <a href="#" id="toggle-console">Show/Hide Console</a>
                    </div>
                </div>
                <a class="menu-item" href="#" id="compile">Build &amp; Run</a>
            </div>
            <div class="navbar-right-menu">
                <div class="dropdown">
                    <div class="menu-item">Sharing</div>
                    <div class="dropdown-content">
                        <a href="#" id="share">Share</a>
                        <a href="#" id="download">Download HTML</a>
                    </div>
                </div>
                <div class="dropdown">
                    <div class="menu-item">Links</div>
                    <div class="dropdown-content">
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker">PGEtinker on Github</a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=bug&projects=&template=bug_report.md&title=">Report an issue</a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=enhancement&projects=&template=feature_request.md&title=">Request a new feature</a>
                        <a target="_blank" href="https://github.com/OneLoneCoder/olcPixelGameEngine">olcPixelGameEngine</a>
                        <a target="_blank" href="https://emscripten.org/">Emscripten</a>
                    </div>
                </div>
            </div>
        </nav>
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
    </div>
    <textarea id="code" style="display: none;">{{ $code }}</textarea>
</body>
</html>