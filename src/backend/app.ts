import config from "../config.ts";

import { createHmac } from "crypto";
import { exec } from "node:child_process";
import express, { Application, Request, Response } from 'express';
import * as fs from 'fs-extra';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { DataTypes, Model, Sequelize } from "sequelize";
import Hashids from "hashids";
import { registerHelper } from "hbs";

export let sequelize : Sequelize;

fs.ensureDirSync(config.dataPath);

if(config.db.dialect === "sqlite")
{
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: config.db.storage,
    });
}
else
{
    sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
        dialect: config.db.dialect,
        host: config.db.host,
    });
}

export class Code extends Model
{
    declare id   : number;
    declare code : string;
    declare hash : string;
    declare slug : string;
};

Code.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    hash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    slug: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
}, {
    tableName: 'codes',
    sequelize,
});

export async function databaseConnect()
{
    try
    {
        await sequelize.authenticate();
    }
    catch(err)
    {
        throw err;
    }

    await sequelize.sync();
}

export function getRandomChars(length: number = 11) : string
{
    const dictionary : string  = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    
    let result  : string = "";

    for(let i = 0; i < length; i++)
        result += dictionary[Math.floor(Math.random() * dictionary.length)];
        
    return result;
}

export function getHash(object: any) : string
{
    object = (typeof object === 'string') ? object : JSON.stringify(object);

    return createHmac('sha256', 'pgetinker')
                .update(object)
                .digest().toString('base64url');
}

export const screenshot = async (url: string, delay: number, filePath: string) : Promise<any> =>
{
    if(Array.from(filePath)[0] !== "/")
        throw new Error("filePath must be absolute path");

    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_EXECUTABLE || undefined,

        // "new" is being pushed but it's performance is much slower
        // @ts-ignore: "old" not defined in spec, but is currently valid
        headless: "old",
        args: [
            '--no-sandbox',
            '--use-gl=egl',
            '--no-zygote',
        ],
    });

    const page = await browser.newPage();
    await page.goto(url);
    await new Promise<void>((resolve) => setTimeout(() => resolve(), delay));
    const screenshot = await page.screenshot({encoding: 'binary'});
    browser.close();

    fs.writeFileSync(filePath, screenshot);
};


function checkSource(source: string) : string | null
{
    const re = /^\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/;
    const failed: string[] = [];

    let lines: string[] = source.split("\n");
    for(let i = 0; i < lines.length; i++)
    {
        if(re.test(lines[i]))
            failed.push(`/pgetinker.cpp:${i + 1}:1: no absolute or relative includes please`);
    }

    if (failed.length > 0) return failed.join('\n');
    return null;
}

type CompilerResults = {
    stdout      : string;
    stderr      : string;
    killed      : boolean;
    success     : boolean;
    outputPath? : string;
    jsPath?     : string;
    wasmPath?   : string;
    sourcePath? : string;
};

function prepareCompilerResults(results: any, outputPath: string) : CompilerResults
{
    let defaultResults : CompilerResults = {
        stdout: '',
        stderr: '',
        killed: false,
        success: false,
        outputPath: outputPath,
    };

    results = {...defaultResults, ...results};

    ["stderr", "stdout"].forEach((key) =>
    {
        results[key] = results[key].replaceAll(outputPath, "");
        results[key] = results[key].replaceAll(path.resolve("./"), "");
        results[key] = results[key].replaceAll("/third_party", "");
    });

    return results;
}

export function getCompilerOutputPath(prefix: string = "tmp.")
{
    let attempt       : number  = 0;
    let directoryName : string = "";
    
    do
    {
        // limit the attempts to 3
        if(attempt > 3)
            throw new Error("unable to create temporary directory for compiler. (" + directoryName + ")");

        // track the number of attempts
        attempt++;
        
        // get random directory name
        directoryName = getRandomChars();
        
        // if it does not exist, we can continue
        if(!fs.existsSync(path.join(config.dataPath, `${prefix}${directoryName}`)))
            break;
        
        // if we make it here, try again!
    } while(true); 
    
    // if we make it here, we have a valid directory to write files into
    return path.join(config.dataPath, `${prefix}${directoryName}`);
}

export async function compile(source: string, outputPath: string = "") : Promise<CompilerResults>
{
    // check the source for hacks and such
    const checkSourceResults = checkSource(source);
    
    if(checkSourceResults != null)
        return prepareCompilerResults({ stderr: checkSourceResults }, '');

    if(outputPath == "")
        outputPath = getCompilerOutputPath();

    fs.ensureDirSync(outputPath);

    const sourcePath   = path.join(outputPath, 'pgetinker.cpp');
    const jsPath       = path.join(outputPath, 'pgetinker.js');
    const wasmPath     = path.join(outputPath, 'pgetinker.wasm');

    fs.writeFileSync(sourcePath, source);

    const command = [
        "em++",
        "-O1",
        `${sourcePath}`,
        // `${path.resolve("./")}/cpp/olcPixelGameEngine.cpp.o`,
        // `${path.resolve("./")}/cpp/olcSoundWaveEngine.cpp.o`,
        `-o ${jsPath}`,
        `-I${path.resolve("./")}/third_party/olcPixelGameEngine`,
        `-I${path.resolve("./")}/third_party/olcPixelGameEngine/extensions`,
        `-I${path.resolve("./")}/third_party/olcPixelGameEngine/utilities`,
        `-I${path.resolve("./")}/third_party/olcSoundWaveEngine`,
        "-sASYNCIFY",
        "-sALLOW_MEMORY_GROWTH=1",
        "-sMAX_WEBGL_VERSION=2",
        "-sMIN_WEBGL_VERSION=2",
        "-sUSE_LIBPNG=1",
        "-sUSE_SDL_MIXER=2",
        "-sLLD_REPORT_UNDEFINED",
    ].join(' ');

    const start: number = new Date().getTime();

    let results = await new Promise((resolve) =>
    {
        exec(command, { timeout: 10000 }, (error, stdout, stderr) =>
        {
            const killed: boolean = (error?.killed) ? true : false;
            resolve({ stdout, stderr, killed });
        });
    });

    let executionTime = (new Date().getTime()) - start;

    let compileSuccess: boolean = (fs.existsSync(jsPath) && fs.existsSync(wasmPath));

    results = { ...results as any, executionTime, success: compileSuccess, sourcePath, jsPath, wasmPath };

    return prepareCompilerResults(results, outputPath);
}

export const app : Application = express();

app.use(express.json());

app.get("/api/default-code", (_req: Request, res: Response) =>
{
    let defaultCode = fs.readFileSync(path.resolve("./", "examples", "default.cpp")).toString('utf8');
    res.status(200).json({code: defaultCode});
});

app.get("/api/monaco-model/:filename", (req: Request, res: Response) =>
{
    // valid files
    let validFileMap: any = {
        "olcPixelGameEngine.h": "third_party/olcPixelGameEngine/olcPixelGameEngine.h",

        "olcPGEX_Graphics2D.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_Graphics2D.h",
        "olcPGEX_Graphics3D.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_Graphics3D.h",
        "olcPGEX_Network.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_Network.h",
        "olcPGEX_PopUpMenu.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_PopUpMenu.h",
        "olcPGEX_QuickGUI.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_QuickGUI.h",
        "olcPGEX_RayCastWorld.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_RayCastWorld.h",
        "olcPGEX_Sound.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_Sound.h",
        "olcPGEX_SplashScreen.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_SplashScreen.h",
        "olcPGEX_TransformedView.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_TransformedView.h",
        "olcPGEX_Wireframe.h": "third_party/olcPixelGameEngine/extensions/olcPGEX_Wireframe.h",

        "olcUTIL_Animate2D.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_Camera2D.h",
        "olcUTIL_Camera2D.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_Container.h",
        "olcUTIL_Container.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_DataFile.h",
        "olcUTIL_DataFile.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_Geometry2D.h",
        "olcUTIL_Geometry2D.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_Animate2D.h",
        "olcUTIL_Palette.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_Palette.h",
        "olcUTIL_QuadTree.h": "third_party/olcPixelGameEngine/utilities/olcUTIL_QuadTree.h",

        "olcSoundWaveEngine.h": "third_party/olcSoundWaveEngine/olcSoundWaveEngine.h",
    };

    if(validFileMap.hasOwnProperty(req.params.filename))
    {
        let fileContent = fs.readFileSync(path.resolve("./", validFileMap[req.params.filename])).toString('utf8');
        res.status(200).json({ success: true, code: fileContent });
        return;
    }

    res.status(404).json({ success: false, message: "not found"});
});

app.post("/api/compile", async (req: Request, res: Response) =>
{
    if(req.body.code === undefined)
    {
        res.status(401).json({ success: false, message: "Missing Source Code" });
        return;
    }

    if(req.body.code.length > 50000)
    {
        res.status(401).json({ success: false, message: "Source Code Too Large" });
        return;
    }

    const result = await compile(req.body.code, getCompilerOutputPath());

    delete result.outputPath;
    delete result.jsPath;
    delete result.wasmPath;
    delete result.sourcePath;

    res.status(200).json(result);
});

app.post("/api/share", async (req: Request, res: Response) =>
{
    if(req.body.code === undefined)
    {
        res.status(401).json({ success: false, message: "Missing Source Code" });
        return;
    }

    if(req.body.code.length > 50000)
    {
        res.status(401).json({ success: false, message: "Source Code Too Large" });
        return;
    }
    
    let hashids : Hashids = new Hashids(config.hash.secret, config.hash.minLength);
    let hashCode = getHash(req.body.code);

    const [ code, created ] = await Code.findOrBuild({
        where: {
            hash: hashCode,
        },
        defaults: {
            code: req.body.code,
            hash: hashCode,
            slug: "",
        },
    });
    
    // if we've already shared this code, short circuit with data from the database
    if(!created)
    {
        res.status(200).json({
            success: true,
            message: "",
            slug: code.slug,
            "share_url": `${config.appUrl}/s/${code.slug}`,
            "embed_url": `${config.appUrl}/embed/${code.slug}`,
            "image_url": `${config.appUrl}/data/${code.slug}}/screen.png`,
        });
        return;
    }

    const tempPath = getCompilerOutputPath("shared.");
    const result = await compile(req.body.code, tempPath);

    // if compilation fails, tell them
    if(!result.success)
    {
        delete result.outputPath;
        delete result.jsPath;
        delete result.wasmPath;
        delete result.sourcePath;
    
        res.status(200).json(result);
        return;
    }
    
    // commit the code to the database so we have a unique id to create the slug
    await code.save();
    
    // create the slug
    code.slug = hashids.encode(code.id);
    
    // commit the code to the database
    await code.save();
    
    // let's take a screenshot
    await screenshot(`${config.appUrl}/embed/${code.slug}`, 5000, path.join(tempPath, "screen.png"));

    // move to the final file location
    fs.renameSync(result.outputPath!, path.join(config.dataPath, code.slug))

    res.status(200).json({
        success: true,
        message: "",
        slug: code.slug,
        "share_url": `${config.appUrl}/s/${code.slug}`,
        "embed_url": `${config.appUrl}/embed/${code.slug}`,
        "image_url": `${config.appUrl}/data/${code.slug}/screen.png`,
    });
});

app.use("/data", express.static(config.dataPath));

app.set("views", "./views");

app.set("view engine", "hbs");

registerHelper("vite-script", (src: string) =>
{
    if(config.mode === "development")
    {
        return `<script type="module" src="/${src}"></script>`
    }
    
    if(src == "@vite/client")
    {
        return "<!-- skipped vite client in production -->";
    }

    let manifest = fs.readJSONSync("./dist/manifest.json");
    let output : string[]  = [];
    
    if(manifest[src] !== undefined)
    {
        // check for stylesheets
        if(manifest[src].css !== undefined)
        {
            output.push(`<link rel="stylesheet" href="/${manifest[src].css}">`);
        }
        
        // check for script file
        if(manifest[src].file !== undefined)
        {
            output.push(`<script type="module" src="/${manifest[src].file}"></script>`);
        }
        
        if(manifest[src].dynamicImports !== undefined)
        {
            manifest[src].dynamicImports.forEach((item : string) => 
            {
                if(manifest[item].file.includes(".css"))
                    output.push(`<link rel="stylesheet" href="/${manifest[item].file}">`);
                
                if(manifest[item].file.includes(".js"))
                    output.push(`<script type="module" src="/${manifest[item].file}"></script>`);
            });
        }
    }

    return output.join("");
});

app.get("/player/:id?", (req: Request, res: Response) => {

    if(!req.params.id)
    {
        res.render("player-intro", {
            env: {
                APP_URL: config.appUrl,
            },
        });

        return;
    }

    res.render("player", {
        pgetinker: `/data/${req.params.id}/pgetinker.js`,
        env: {
            APP_URL: config.appUrl,
        },
    });
});

app.get("/embed/:id", (req: Request, res: Response) =>
{
    res.render("player", {
        pgetinker: `/data/${req.params.id}/pgetinker.js`,
        env: {
            APP_URL: config.appUrl,
        },
    });
});

app.get("/s/:id", (_req: Request, res: Response) =>
{
    res.render("index", {
        title: "PGEtinker",
        env: {
            APP_URL: config.appUrl,
        },
    });
});

app.get("/", (_req: Request, res: Response) =>
{
    res.render("index", {
        title: "PGEtinker",
        env: {
            APP_URL: config.appUrl,
        },
    });
});

export default app;
