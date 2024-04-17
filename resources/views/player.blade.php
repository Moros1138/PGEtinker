<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Frame | PGEtinker</title>
    <style>
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: #333;
    color: #fff;
    overflow: hidden;
}
#app {
    width: 100%;
    height: 100%;
    padding: 1rem;
}
.light {
    background: #fff;
    color: #000;
}
    </style>
</head>
<body>
    <div id="app">    
        <h1>PGEtinker</h1>
        <p>Welcome! Play with the code, push buttons</p>
    </div>
    <script>
        window.addEventListener("message", (event) =>
        {
            if(typeof event.data !== "object")
                return;
               
            if(typeof event.data.message !== "string")
                return;

            if(event.data.message === "set-theme")
            {
                document.querySelector("body").className = event.data.theme;
            }
        });
        
        setTimeout(() =>
        {
            window.parent.postMessage({
                message: "player-ready",
            }, "*");
        }, 50);
    </script>
</body>
</html>