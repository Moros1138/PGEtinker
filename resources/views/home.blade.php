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
<body>

    <div id="app">
        <nav id="header">
            <a class="brand" href="/">
                PGEtinker
            </a>
            <div class="navbar-left-menu">
                <div class="dropdown">
                    <div dusk="settings-menu" class="menu-item">
                        <i data-lucide="menu"></i>
                        Settings
                    </div>
                    <div class="dropdown-content">
                        <a href="#" id="default-code">
                            <i data-lucide="newspaper"></i>
                            Default Code
                        </a>
                        <a href="#" id="toggle-theme">
                            <i data-lucide="sun-moon"></i>    
                            Toggle Theme
                        </a>
                        <a href="#" id="default-layout">
                            <i data-lucide="undo-dot"></i>
                            Restore Default Layout
                        </a>
                        <a href="#" id="toggle-console">
                            <i data-lucide="square-chevron-right"></i>
                            Show/Hide Console
                        </a>
                    </div>
                </div>
                <a class="menu-item" href="#" id="compile">
                    <i data-lucide="circle-play"></i>
                    Build &amp; Run
                </a>
            </div>
            <div class="navbar-right-menu">
                <div class="dropdown sponsor">
                    Sponsor:&nbsp;
                    <a href="{{ $navBarSponsorLink }}" target="_blank" title="{{ $navBarSponsorText }}">
                        {{ $navBarSponsorText }}
                    </a>
                </div>
                <a class="menu-item" id="supporters" href="#">
                    Supporters
                </a>
                <div class="dropdown">
                    <div class="menu-item" dusk="sharing-menu">Sharing</div>
                    <div class="dropdown-content">
                        <a href="#" id="share">
                            <i data-lucide="share2"></i>
                            Share
                        </a>
                        <a href="#" id="download">
                            <i data-lucide="download"></i>
                            Download HTML
                        </a>
                    </div>
                </div>
                <div class="dropdown">
                    <div class="menu-item">Links</div>
                    <div class="dropdown-content">
                        <a target="_blank" href="https://patreon.com/PGEtinker">
                            <i data-lucide="circle-dollar-sign"></i>
                            Become a Supporter
                        </a>
                        <a href="#" id="news-and-updates">
                            <i data-lucide="badge-plus"></i>    
                            What's New
                        </a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker">
                            <i data-lucide="github"></i>
                            PGEtinker on Github
                        </a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=bug&projects=&template=bug_report.md&title=Bug in Version: {{ env('VERSION', 'develop') }}">
                            <i data-lucide="bug"></i>
                            Report an issue
                        </a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=enhancement&projects=&template=feature_request.md&title=">
                            <i data-lucide="pencil-ruler"></i>
                            Request a new feature
                        </a>
                        <a target="_blank" href="https://github.com/OneLoneCoder">
                            <i data-lucide="github"></i>
                            OneLoneCoder on Github
                        </a>
                        <a target="_blank" href="https://emscripten.org/">
                            <i data-lucide="external-link"></i>
                            Emscripten
                        </a>
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