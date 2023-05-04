import express, { Express, Request, Response } from 'express';
import { __dirname, readFile } from './utils';
import path from 'path';
import { compile } from './compiler';

export const app : Express = express();

app.use(express.json());

app.get("/api/default-code", (req: Request, res: Response) =>
{
    let defaultCode = readFile(path.resolve(__dirname, "examples", "default.cpp"));
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
        let fileContent = readFile(path.resolve(__dirname, validFileMap[req.params.filename]));
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

    res.status(200).json(result);
});

export default app;
