import { exec } from "node:child_process";
import mktemp from "mktemp";
import { rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";


/**
 * @typedef {ObjectDefinition}
 * @property {string} define - the implementation macro
 * @property {string} objectFile - the name of the object file
 */

/** @type {Array<ObjectDefinition>} librarymacroToObject */
const libraryMacroToObject = [
    {
        define: 'OLC_PGE_APPLICATION',
        objectFile: 'olcPixelGameEngine.o',
    },{
        define: 'OLC_SOUNDWAVE_ENGINE',
        objectFile: 'olcSoundWaveEngine.o',
    },{
        define: 'OLC_PGEX_GRAPHICS2D',
        objectFile: 'olcPGEX_Graphics2D.o',
    },{
        define: 'OLC_PGEX_GRAPHICS3D',
        objectFile: 'olcPGEX_Graphics3D.o',
    },{
        define: 'OLC_PGEX_POPUPMENU',
        objectFile: 'olcPGEX_PopUpMenu.o',
    },{
        define: 'OLC_PGEX_QUICKGUI',
        objectFile: 'olcPGEX_QuickGUI.o',
    },{
        define: 'OLC_PGEX_RAYCASTWORLD',
        objectFile: 'olcPGEX_RayCastWorld.o',
    },{
        define: 'OLC_PGEX_SOUND',
        objectFile: 'olcPGEX_Sound.o',
    },{
        define: 'OLC_PGEX_SPLASHSCREEN',
        objectFile: 'olcPGEX_SplashScreen.o',
    },{
        define: 'OLC_PGEX_TRANSFORMEDVIEW',
        objectFile: 'olcPGEX_TransformedView.o',
    },{
        define: 'OLC_PGEX_WIREFRAME',
        objectFile: 'olcPGEX_Wireframe.o',
    }
];

/** @type {string} - which set of scripts are we building with, "local" or "docker" */
const compileScript = process.env.COMPILE_SCRIPT || "local";

/** @type {RegExp} - regex pattern to detect absolute path in include/import macros */
const absolutePathRegex = /^\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/;

/**
 * attempts to compile the provided code, rejects when there are errors, resolve on success
 * @param {string} code 
 * @returns {Promise<any>}
 */
function Compile(code)
{
    return new Promise((resolve, reject) =>
    {
        /** @type {Array<string>} */
        let linesOfCode = code.split("\n");
        
        /** @type {Array<string>} */
        let errors    = [];
        
        /** @type {Array<string>} */
        let libraries = [];

        // line by line code processing and filtering
        for(let i = 0; i < linesOfCode.length; i++)
        {
            // filter include macros with an absolute path, naughty naughty
            if(absolutePathRegex.test(linesOfCode[i]))
            {
                errors.push(`/pgetinker.cpp:${i+1}:1: error: absolute and relative includes are not allowed.`);
                
                // no further processing required for this line, NEXT!!
                continue;
            }

            // filter macros to detect implementation #define
            if(linesOfCode[i].includes("#define"))
            {
                /** @type {boolean} */
                let foundImplementationMacro = false;
                
                for(let j = 0; j < libraryMacroToObject.length; j++)
                {
                    if(linesOfCode[i].includes(libraryMacroToObject[j].define))
                    {
                        // blank the line
                        linesOfCode[i] = "";

                        // indicated that we use this library
                        libraries.push(libraryMacroToObject[j].objectFile);

                        foundImplementationMacro = true;
                        break;
                    }
                }

                // thank you, NEXT!!
                if(foundImplementationMacro)
                    continue;
            }
        }
        
        // bail if we have errors here, no need to invoke the compiler
        if(errors.length > 0)
        {
            reject({
                code: 400,
                stdout: "",
                stderr: errors.join("\n")
            });
            return;
        }

        // create the workspace and save it's location
        const workspaceDirectory = mktemp.createDirSync(join(tmpdir(), "pgetinker-XXXXXX"));
        const sourceFile = join(workspaceDirectory, "pgetinker.cpp");
        const outputFile = join(workspaceDirectory, "pgetinker.html");

        // make sure the workspace exists.
        if(!existsSync(workspaceDirectory))
        {
            reject({
                code: 500,
                message: "Could not create workspace."
            });
            return;
        }
        
        // try to create the source file and fill it with linesOfCode
        writeFileSync(sourceFile, linesOfCode.join("\n"));

        if(!existsSync(sourceFile))
        {
            reject({
                code: 500,
                message: "Could not create source file."
            })
            
            // cleanup
            rmSync(workspaceDirectory, { force: true, recursive: true });
            return;
        }

        let compileCommand = [
            `scripts/${compileScript}-compile.sh`,
            workspaceDirectory,
        ];
    
        let linkCommand = [
            `scripts/${compileScript}-link.sh`,
            workspaceDirectory,
            ...libraries,
        ];
    
        function FilterOutput(text)
        {
            text = text.replaceAll("/src/tmp", "");
            text = text.replaceAll("/src/third-party/olcPixelGameEngine", "");
            text = text.replaceAll("/src/third-party/olcPixelGameEngine/extensions", "");
            text = text.replaceAll("/src/third-party/olcPixelGameEngine/utilities", "");
            text = text.replaceAll("/src/third-party/olcSoundWaveEngine", "");
            text = text.replaceAll("/src/cache/third-party", "");
            
            text = text.replaceAll(workspaceDirectory, "");
            text = text.replaceAll("./third-party/olcPixelGameEngine", "");
            text = text.replaceAll("./third-party/olcPixelGameEngine/extensions", "");
            text = text.replaceAll("./third-party/olcPixelGameEngine/utilities", "");
            text = text.replaceAll("./third-party/olcSoundWaveEngine", "");
            
            text = text.split("\n");
            let retval = [];
            for(let i = 0; i < text.length; i++)
            {
                if(text[i].indexOf("/pgetinker.cpp") === 0)
                    retval.push(text[i]);
            }
            
            return retval.join("\n");
        }

        exec(compileCommand.join(" "), (error, stdout, stderr) =>
        {
            if(error)
            {
                reject({
                    code: 400,
                    stdout: FilterOutput(stdout),
                    stderr: FilterOutput(stderr),
                });
    
                // cleanup
                rmSync(workspaceDirectory, { force: true, recursive: true});
                return;
            }
            exec(linkCommand.join(" "), (error, stdout, stderr) =>
            {
                if(error)
                {
                    reject({
                        code: 400,
                        stdout: FilterOutput(stdout),
                        stderr: FilterOutput(stderr),
                    });
        
                    // cleanup
                    rmSync(workspaceDirectory, { force: true, recursive: true});
                    return;
                }
    
                if(existsSync(outputFile))
                {
                    resolve({
                        code: 200,
                        html: readFileSync(outputFile, "utf8"),
                    });

                    // cleanup
                    rmSync(workspaceDirectory, { force: true, recursive: true});
                    return;
                }
    
                reject({
                    code: 42069,
                    message: "something really fucked up happened to get to this point."
                });
                
                // cleanup
                rmSync(workspaceDirectory, { force: true, recursive: true});
            });
        });
    });

}

/** @param {Express.Application} app*/
export default function ApiHandler(app)
{
    
    app.post("/api/compile", (request, response) =>
    {
        // bail out if we haven't been provided some code to process
        if(typeof request.body.code === "undefined")
        {
            response.status(400)
                    .send({
                        message: "missing required parameters"
                    });
            return;
        }
        
        Compile(request.body.code)
            .then((result) =>
            {
                response.status(result.code)
                        .send(result);
            })
            .catch((error) =>
            {
                response.status(error.code)
                        .send(error);
            });
    });

    app.post("/api/share", (request, response) =>
    {
        // bail out if we haven't been provided some code to process
        if(typeof request.body.code === "undefined")
        {
            response.status(400)
                    .send({
                        message: "missing required parameters"
                    });
            return;
        }

        Compile(request.body.code)
            .then((result) =>
            {
                
                // TODO: actual sharing code
                response.status(result.code)
                        .send(result);
            })
            .catch((error) =>
            {
                response.status(error.code)
                        .send(error);
            });

    });
}
