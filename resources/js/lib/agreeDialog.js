export default function agreeDialog()
{
    return new Promise((resolve, reject) =>
    {
        let agreeDialog = document.createElement("div");
    
        agreeDialog.classList.toggle("dialog", true);
        agreeDialog.classList.toggle("first-time", true);

        agreeDialog.innerHTML = `
        <div class="window">
            <div class="header">Welome to PGEtinker!</div>
            <div class="content">
                <h1>Hello and Welcome</h1>
                <p>
                    It would appear to be the first time you've
                    visited this site, at least from this browser.
                    In order for PGEtinker to function we require
                    your permission to do some things.
                </p>
                <h3>Terms, in Plain English</h3>
                <p>
                    You agree that PGEtinker has permission to:
                </p>
                <ul>
                    <li>
                        Store information in your browser to be used within
                        the confines of the PGEtinker online application.
                        It's for stuff like persiting your layout, your
                        theme, and other options so when you come back
                        it's the way you left it.
                    </li>
                    <li>
                        Compile and display the code you provide.
                    </li>    
                    <li>
                        Retain and review the code you have provided
                        for the purposes of diagnosing problems with the
                        PGEtinker online application.
                    </li>    
                    <li>
                        Share your code worldwide. This only applies if you
                        use the "Share" functionality.
                    </li>
                    <li>
                        To use <a href="https://developers.cloudflare.com/analytics/web-analytics/" target="_blank">
                        passive monitoring analytics</a> for the purpose
                        of identifying problems with the app and improving
                        the overall experience.
                    </li>
                </ul>
            </div>
            <div class="footer">
                <button type="button" id="i-disagree" class="cancel">I Disagree</button>
                <button type="button" id="i-agree" class="ok">I Agree</button>
            </div>
        </div>`;
        
        agreeDialog.querySelector("#i-disagree").addEventListener("click", (event) =>
        {
            reject();
            agreeDialog.remove();
        });

        agreeDialog.querySelector("#i-agree").addEventListener("click", (event) =>
        {
            resolve();
            agreeDialog.remove();
        });
        
        document.body.appendChild(agreeDialog);
    });

}