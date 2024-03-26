// regex pattern to detect absolute path in include/import macros
const absolutePathRegex = /^\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/;

const libraryMacroToObject = [
    {
        define: 'OLC_PGE_APPLICATION',
        objectFiles: 'olcPixelGameEngine.o',
    },{
        define: 'OLC_SOUNDWAVE_ENGINE',
        objectFiles: 'olcSoundWaveEngine.o',
    },{
        define: 'OLC_PGEX_GRAPHICS2D',
        objectFiles: 'olcPGEX_Graphics2D.o',
    },{
        define: 'OLC_PGEX_GRAPHICS3D',
        objectFiles: 'olcPGEX_Graphics3D.o',
    },{
        define: 'OLC_PGEX_POPUPMENU',
        objectFiles: 'olcPGEX_PopUpMenu.o',
    },{
        define: 'OLC_PGEX_QUICKGUI',
        objectFiles: 'olcPGEX_QuickGUI.o',
    },{
        define: 'OLC_PGEX_RAYCASTWORLD',
        objectFiles: 'olcPGEX_RayCastWorld.o',
    },{
        define: 'OLC_PGEX_SOUND',
        objectFiles: 'olcPGEX_Sound.o',
    },{
        define: 'OLC_PGEX_SPLASHSCREEN',
        objectFiles: 'olcPGEX_SplashScreen.o',
    },{
        define: 'OLC_PGEX_TRANSFORMEDVIEW',
        objectFiles: 'olcPGEX_TransformedView.o',
    },{
        define: 'OLC_PGEX_WIREFRAME',
        objectFiles: 'olcPGEX_Wireframe.o',
    }
];

const { exec,spawn } = require('node:child_process');
const express = require('express');
const morgan = require('morgan');

const app = express();
const port = 3000

app.use(morgan('tiny'))
app.use(express.static('public_html'))
app.use(express.json());

app.post("/compile", async(req, res) =>
{
    // bail out if we haven't been provided some code to process
    if(typeof req.body.code === 'undefined')
    {
        res.status(400).send({code: 400, message: "missing required parameters"});
        return;
    }
    
    // break the code up into an array
    let code = req.body.code.split("\n");
    let libraries = [];
    let errors    = [];

    // line by line code processing and filtering
    for(i = 0; i < code.length; i++)
    {
        // filter include macros with an absolute path, naughty naughty
        if(absolutePathRegex.test(code[i]))
        {
            errors.push(`/pgetinker.cpp:${i + 1}:1: no absolute or relative includes please`);
            continue;
        }
            
        // filter macros to detect implementation defines.
        if(code[i].includes('#define'))
        {
            let foundImplementationMacro = false;
            for(j = 0; j < libraryMacroToObject.length; j++)
            {
                if(code[i].includes(libraryMacroToObject[j].define))
                {
                    // blank the line
                    code[i] = "";
                    // indicate that we use this library
                    libraries.push(libraryMacroToObject[j].objectFiles);

                    foundImplementationMacro = true;
                    break;
                }
            }
            
            // thank you, NEXT!!
            if(foundImplementationMacro)
                continue;
        }
    }
    
    // if we've detected errors at this point, let's bail out here, without invoking the compiler
    if(errors.length > 0)
    {
        res.status(400).send({code: 400, message: "missing required parameters", stdout: "", stderr: errors.join("\n")});
        return;
    }

    // we made it here, time to try the compiler
    const compiler = exec("./scripts/build-local.sh " + libraries.join(" "), (error, stdout, stderr) =>
    {
        res.send({
            code: 200,
            stdout: stdout,
            stderr: stderr
        });
    });
    
    // feed the code to the script, via pipe
    compiler.stdin.write(code.join("\n"));
    compiler.stdin.end();

});

app.listen(port, () =>
{
    console.log(`PGEtinker Server listening on port ${port}`);
});

