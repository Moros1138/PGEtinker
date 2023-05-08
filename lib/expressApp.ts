import express, { Application, Request, Response, NextFunction } from 'express';
import { __dirname, getHash } from './utils';
import * as fs from 'fs-extra';
import path from 'node:path';
import { compile } from './compiler';
import { StorageLocal } from './storage/local';
import { logger } from './logger';
import { screenshot } from './screenshot';

const storage = new StorageLocal();

export const app : Application = express();

app.use(express.json());


app.get("/api/default-code", (req: Request, res: Response) =>
{
    let defaultCode = fs.readFileSync(path.join(__dirname, "examples", "default.cpp")).toString('utf8');
    res.status(200).json({code: defaultCode});
});

app.get("/api/monaco-model/:filename", (req: Request, res: Response) =>
{
    // valid files
    let validFileMap = {
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
        let fileContent = fs.readFileSync(path.resolve(__dirname, validFileMap[req.params.filename])).toString('utf8');
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

    const result = await compile(req.body.code);

    delete result.tempPath;
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

    let hashCode = getHash(req.body.code);
    let item: any = null;

    // check if this code has already been shared
    item = await storage.getItem(hashCode);

    // if already shared, skip compile and jump right to the result
    if(item)
    {
        res.status(200).json({
            success: true,
            message: "",
            slug: hashCode,
            "share_url": `http://localhost:3000/s/${hashCode}`,
            "embed_url": `http://localhost:3000/embed/${hashCode}`,
            "image_url": item.screenURL,
        });
        return;
    }

    const tempPath = path.resolve("./", "data", hashCode);
    const result = await compile(req.body.code, tempPath);

    storage.storeItem({
        code: req.body.code,
        jsPath: result.jsPath,
        wasmPath: result.wasmPath,
        screenPath: path.join(tempPath, "screen.png"),
        screenURL: `http://localhost:3000/data/${hashCode}/screen.png`,
        viewCounter: 0,
    });

    await screenshot(`http://localhost:3000/embed/${hashCode}`, 5000, path.join(tempPath, "screen.png"));

    res.status(200).json({
        success: true,
        message: "",
        slug: hashCode,
        "share_url": `http://localhost:3000/s/${hashCode}`,
        "embed_url": `http://localhost:3000/embed/${hashCode}`,
        "image_url": `http://localhost:3000/data/${hashCode}/screen.png`,
    });
});

export default app;
