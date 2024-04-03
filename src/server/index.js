import goldenLayoutBaseStyle from "golden-layout/src/css/goldenlayout-base.css?raw";

export function render()
{
    const head = `
        <meta name="description" value="Interactively develop an olc::PixelGameEngine program from your Browser!">

        <meta property="og:title" content="PGEtinker">
        <meta property="og:description" content="Interactively develop an olc::PixelGameEngine program from your Browser!">
        <meta property="og:type" content="website">

        <link rel="stylesheet" type="text/css" href="/style.css">
        <style>${goldenLayoutBaseStyle}</style>
        <style id="goldenlayout-theme"></style>
    `;


    const html = `
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
    `;

    return {
        html,
        head
    };
}