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
    
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/normalize.scss')}}">
    <link rel="stylesheet" type="text/css" href="{{ Vite::asset('resources/css/app.scss')}}">
    @vite('resources/js/app-preload.ts')
</head>
<body>
    <div id="app">

        <div id="header">
            <nav>
                <ul class="menu left-menu">
                    <li class="brand">
                        <a href="/">
                            PGEtinker
                        </a>
                    </li>
                    <li class="item" dusk="settings-menu" id="settings-menu">
                        <a tabindex="0">
                            <i data-lucide="menu"></i>
                            <span>Settings</span>
                        </a>
                    </li>
                    @include("shared.examples")
                    <li class="item">
                        <a id="start-stop">
                            <i data-lucide="circle-play"></i><i data-lucide="circle-stop" class="hidden"></i>
                            <span>Run</span>
                        </a>
                    </li>
                    <li class="separator"></li>
                </ul>
                <ul class="menu right-menu">
                    <li class="item">
                        <a target="_blank" href="/wiki/" title="Help Wiki">
                            <i data-lucide="circle-help"></i>
                            <span>Help</span>
                        </a>
                    </li>
                    <li class="item">
                        <a id="supporters">
                            <svg class="lucide" fill="currentColor" stroke="none" width="24" height="24" xmlns="http://www.w3.org/2000/svg"viewBox="0 0 1080 1080"><rect width="192.44098" height="963.00232" x="45.960854" y="58.49884" /><circle cx="694.31726" cy="424.37286" r="357.3031" /></svg>
                            <span>Supporters</span>
                        </a>
                    </li>
                    <li class="item has-submenu">
                        <a dusk="sharing-menu" tabindex="0">
                            <i data-lucide="share2"></i>
                            <span>Sharing</span>
                        </a>
                        <ul class="submenu">
                            <li class="subitem">
                                <a href="#" id="share">
                                    <i data-lucide="share2"></i>
                                    <span>Share</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a href="#" id="download">
                                    <i data-lucide="download"></i>
                                    <span>Download HTML</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="item has-submenu">
                        <a tabindex="0">
                            <i data-lucide="link"></i>
                            <span>Links</span>
                        </a>
                        <ul class="submenu">
                            <li class="subitem">
                                <a href="#" id="news-and-updates">
                                    <i data-lucide="badge-plus"></i>    
                                    <span>What's New</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://patreon.com/PGEtinker">
                                    <i data-lucide="circle-dollar-sign"></i>
                                    <span>Support on Patreon</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://www.paypal.com/donate?hosted_button_id=JRELVL6T7NZBE">
                                    <i data-lucide="circle-dollar-sign"></i>
                                    <span>Make a Donation on Paypal</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://github.com/Moros1138/PGEtinker">
                                    <i data-lucide="github"></i>
                                    <span>PGEtinker on Github</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=bug&projects=&template=bug_report.md&title=Bug in Version: {{ substr(env('VERSION', 'develop'), 0, 7) }}">
                                    <i data-lucide="bug"></i>
                                    <span>Report an issue</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://github.com/Moros1138/PGEtinker/issues/new?assignees=Moros1138&labels=enhancement&projects=&template=feature_request.md&title=">
                                    <i data-lucide="pencil-ruler"></i>
                                    <span>Request a new feature</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://www.youtube.com/channel/UC-yuWVUplUJZvieEligKBkA">
                                    <i data-lucide="youtube"></i>
                                    <span>Javidx9 on Youtube</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://github.com/OneLoneCoder">
                                    <i data-lucide="github"></i>
                                    <span>OneLoneCoder on Github</span>
                                </a>
                            </li>
                            <li class="subitem">
                                <a target="_blank" href="https://emscripten.org/">
                                    <i data-lucide="external-link"></i>
                                    <span>Emscripten</span>
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
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
    
    <template id="examples">
        @include("shared.examples")
    </template>
    
    @include("shared.analytics")
</body>
</html>