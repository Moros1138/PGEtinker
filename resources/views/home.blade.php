<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="manifest" href="manifest.json">
    
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="PGEtinker" />

    <meta property="twitter:description" content="Interactively build olcPixelGameEngine programs right from the browser." />
@if (empty($share_thumb_url))
    <meta property="twitter:image:src" content="{{ env("APP_URL") }}/images/PGEtinker-screenshot.png" />
@else
    <meta property="twitter:image:src" content="{{ $share_thumb_url }}" />
@endif

    <meta property="og:title" content="PGEtinker" />
    <meta property="og:description" content="Interactively build olcPixelGameEngine programs right from the browser." />
    <meta property="url" content="{{ env("APP_URL") }}" />
    <meta property="og:type" content="website" />
@if (empty($share_thumb_url))
    <meta property="og:image" content="{{ env("APP_URL") }}/images/PGEtinker-screenshot.png" />
    <meta property="og:image:secure_url" content="{{ env("APP_URL") }}/images/PGEtinker-screenshot.png" />
@else
    <meta property="og:image" content="{{ $share_thumb_url }}" />
    <meta property="og:image:secure_url" content="{{ $share_thumb_url }}" />
@endif

    <title>PGEtinker</title>
    
    <link rel="icon" type="text/svg" href="{{ env('APP_URL') }}/favicon.svg">

    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/app/goldenlayout-base.scss')}}">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/app/goldenlayout-dark-theme.scss')}}" id="goldenlayout-dark-theme">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/app/goldenlayout-light-theme.scss')}}" id="goldenlayout-light-theme" disabled>
    
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/app.scss')}}">
    @vite('resources/js/app.ts')
</head>
<body>
    <div id="app">
        <nav id="header">
            <a class="brand" href="/">
                PGEtinker
            </a>
            <div class="navbar-left-menu">
                <div class="dropdown">
                    <div dusk="settings-menu" id="settings-menu" class="menu-item">
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
                    </div>
                </div>
                <a class="menu-item" href="#" id="start-stop">
                    <i data-lucide="circle-play"></i>
                    <i data-lucide="circle-stop" class="hidden"></i>
                    <span>Run</span>
                </a>
            </div>
            <div class="navbar-right-menu">
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
                        <a href="#" id="news-and-updates">
                            <i data-lucide="badge-plus"></i>    
                            What's New
                        </a>
                        <a target="_blank" href="https://patreon.com/PGEtinker">
                            <i data-lucide="circle-dollar-sign"></i>
                            Support on Patreon
                        </a>
                        <a target="_blank" href="https://www.paypal.com/donate?hosted_button_id=JRELVL6T7NZBE">
                            <i data-lucide="circle-dollar-sign"></i>
                            Make a Donation on Paypal
                        </a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker">
                            <i data-lucide="github"></i>
                            PGEtinker on Github
                        </a>
                        <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=bug&projects=&template=bug_report.md&title=Bug in Version: {{ substr(env('VERSION', 'develop'), 0, 7) }}">
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
        <div id="pgetinker-loading">
            <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <p>
                PGEtinker is Loading
            </p>
        </div>
    </div>
    <textarea id="code" style="display: none;"><?php echo $code ?></textarea>
    
    @include("shared.analytics")

</body>
</html>