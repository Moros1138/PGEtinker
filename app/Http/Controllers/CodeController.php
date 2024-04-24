<?php

namespace App\Http\Controllers;

use App\Models\Code;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;
use Illuminate\Support\Facades\Http;

class CodeController extends Controller
{
    function Compile(Request $request)
    {
        $result = $this->compileCode($request->input("code", null));
        unset($result["hash"]);
        
        return response($result, $result["statusCode"])->header("Content-Type", "application/json");
    }
    
    function Share(Request $request)
    {
        $code   = $request->input("code", null);
        $result = $this->compileCode($code);
    
        // if failed to compile, bail
        if($result["statusCode"] !== 200)
        {
            unset($result["hash"]);
            return response($result, $result["statusCode"])->header("Content-Type", "application/json");
        }
    
        // check if we've already tried to share this code
        $share = Code::where("hash", $result["hash"])->first();
        if($share != null)
        {
            $result["shareURL"] = $request->root() . "/s/" . $share->slug;
            unset($result["hash"]);
    
            return response($result, $result["statusCode"])->header("Content-Type", "application/json");
        }
        
        // if we're here, we got a bonafide, unique, and working code to share with the world
        
        // try to make a unique slug
        $tryAgain = true;
        $slug = "";
        do
        {
            // thanks Bixxy and Ciarán for the feedback in #help-each-other
            $slug = str_replace(['+','/','='], ['-','',''], substr(base64_encode(sha1(microtime(),true)), 0, 11));

            if(Code::where("slug", $slug)->first() == null);
            {
                $tryAgain = false;
            }
        } while($tryAgain);
        
        $share = new Code();
    
        $share->code = $code;
        $share->hash = $result["hash"];
        $share->slug = $slug;
    
        if($share->save())
        {
            $result["shareURL"] = $request->root() . "/s/" . $slug;
            unset($result["hash"]);
            
            return response($result, $result["statusCode"])->header("Content-Type", "application/json");
        }
    
        // bad moon rising
        return response([ "statusCode" => 500, "message" => "some major server malfunction" ], 500)->header("Content-Type", "application/json");
    }

    function hashCode($code)
    {
        /**
         * preemptively pad each of these tokens with <space> tokens
         */
        foreach([
            "(","[","{",")","]","}",",","-","+","*","="
        ] as $token)
        {
            $code = str_replace($token, " {$token} ", $code);
        }
        
        /**
         * thanks Bixxy for the general idea here.
         */
        $tokens = token_get_all("<?php " . $code);
        $cppcode = "";
        
        foreach($tokens as $token)
        {
            if(is_array($token))
            {
                $id = token_name($token[0]);
                $text = $token[1];

                /**
                 * skip the <?php opening tag we needed to trick 
                 * token_get_all into parsing our totally not PHP
                 * code for us.
                 */
                if($id == "T_OPEN_TAG")
                    continue;
                 
                /**
                 * skip comments. php considers # to be a comment
                 * so we check for that.
                 */
                if($id == "T_COMMENT" && strpos($text, "#") !== 0)
                    continue;
                /**
                 * oh whitespace, you nuanced bastard!
                 */
                if($id == "T_WHITESPACE")
                {
                    // any whitespace containing any new lines, becomes 1 newline
                    if(str_contains($text, "\n"))
                        $text = "\n";

                    // any whitespace longer than 1, becomes 1
                    if(strlen($text) > 1)
                        $text = " ";

                }

                // if, for any reason we reach here, add it to the code we wanna hash
                $cppcode .= $text;
                continue;
            }
            else
            {
                // any other token is passed through, as is.
                $cppcode .= $token;
            }
        }
        
        // take off multiple new lines left over
        $cppcode = preg_replace('/\n\s*\n/', "\n", $cppcode);

        return hash("sha256", $cppcode);
    }

    function compileCode($code)
    {
        if($code == null)
        {
            Log::debug("Compile: missing required code parameters");
    
            return [
                "statusCode" => 400,
                "message" => "missing required parameters",
            ];
        }
    
        if(strlen($code) > 50000)
        {
            Log::debug("Compile: code exceeds maximum limit");
            return [
                "statusCode" => 400,
                "message" => "code exceeds maximum limit",
            ];
        }
        
        $hashedCode = $this->hashCode($code);
        
        if(env("COMPILER_CACHING", false))
        {
            if(Storage::directoryMissing("compilerCache"))
            {
                Storage::createDirectory("compilerCache");
            }
        
            if(Storage::directoryMissing(("remoteIncludeCache")))
            {
                Storage::createDirectory("remoteIncludeCache");
            }

            if(Storage::fileExists("compilerCache/{$hashedCode}"))
            {
                Log::debug("Compile: cache hit", ["hashedCode" => $hashedCode]);
                
                $html = Storage::read("compilerCache/{$hashedCode}");
            
                return [
                    "statusCode" => 200,
                    "hash" => $hashedCode,
                    "html" => $html,
                ];
            }
        
            Log::debug("Compile: cache miss", ["hashedCode" => $hashedCode]);
        }
        
        if(Storage::directoryMissing("workspaces"))
        {
            Storage::createDirectory("workspaces");    
        }
            
        $directoryName = "workspaces/" . Str::uuid();
        Storage::createDirectory($directoryName);
        
        $log = new Logger("compiler");
        
        $logHandler = new StreamHandler(Storage::path($directoryName) . "/compiler.log");
        $logHandler->setFormatter(new LineFormatter(null, null, true, true));
        
        $log->pushHandler($logHandler);
        
        Log::debug("Compile: working directory created {$directoryName}");
        
        $libraryMap = [
            'OLC_PGE_APPLICATION'      => 'olcPixelGameEngine.o',
            'OLC_SOUNDWAVE_ENGINE'     => 'olcSoundWaveEngine.o',
            'OLC_PGEX_GRAPHICS2D'      => 'olcPGEX_Graphics2D.o',
            'OLC_PGEX_GRAPHICS3D'      => 'olcPGEX_Graphics3D.o',
            'OLC_PGEX_POPUPMENU'       => 'olcPGEX_PopUpMenu.o',
            'OLC_PGEX_QUICKGUI'        => 'olcPGEX_QuickGUI.o',
            'OLC_PGEX_RAYCASTWORLD'    => 'olcPGEX_RayCastWorld.o',
            'OLC_PGEX_SOUND'           => 'olcPGEX_Sound.o',
            'OLC_PGEX_SPLASHSCREEN'    => 'olcPGEX_SplashScreen.o',
            'OLC_PGEX_TRANSFORMEDVIEW' => 'olcPGEX_TransformedView.o',
            'OLC_PGEX_WIREFRAME'       => 'olcPGEX_Wireframe.o',
        ];
    
        $linesOfCode = explode("\n", $code);
        
        $errors = [];
    
        $libraries = [];

        $log->info("begin parsing linesOfCode");

        // line by line code processing and filtering
        for($i = 0; $i < count($linesOfCode); $i++)
        {
            // filter include macros with an absolute or relative path, naughty naughty
            preg_match(
                '/^\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/',
                $linesOfCode[$i],
                $match,
                PREG_OFFSET_CAPTURE,
                0
            );
    
            if(count($match) > 0)
            {
                $errors[] = "/pgetinker.cpp:" . $i + 1 . ":1: error: absolute and relative includes are not allowed.";
                $log->info("found absolute or relative path at line " . $i + 1);
                continue;
            }
    
            // filter macros to detect implementation #define
            if(str_contains($linesOfCode[$i], "#define"))
            {
                $foundImplementationMacro = false;
                foreach($libraryMap as $macro => $objectFileName)
                {
                    if(str_contains($linesOfCode[$i], $macro))
                    {
                        // blank the line
                        $linesOfCode[$i] = "";
                        
                        // indicate that we use this library
                        $libraries[] = "./lib/{$objectFileName}";
                        
                        $log->info("Found implementation macro: {$macro}");
                        $foundImplementationMacro = true;
                        break;
                    }
                }
    
                if($foundImplementationMacro)
                    continue;
            }

            preg_match(
                '/^\s*#\s*i(nclude|mport)(_next)?\s+["<](https:\/\/(.*)[^">]*)[">]/',
                $linesOfCode[$i],
                $match,
                PREG_OFFSET_CAPTURE,
                0
            );

            if(count($match) > 0)
            {
                $log->info("found a potential url for remote include");
                
                $potentialUrl = $match[3][0];
                $potentialFilename = basename($match[3][0]);
                $hashedUrl = hash("sha256", $potentialUrl);

                if(env("COMPILER_CACHING", false))
                {
                    // if we have a cached version of the url's contents, don't pull it
                    if(Storage::fileExists("remoteIncludeCache/{$hashedUrl}"))
                    {
                        $log->info("remote include cache hit");
                        Storage::copy("remoteIncludeCache/{$hashedUrl}", "{$directoryName}/{$potentialFilename}");
                        $linesOfCode[$i] = '#include "' . $potentialFilename .'"';
                        continue;
                    }
                }
                
                $log->info("remote include cache miss");
                
                try
                {
                    $response = Http::head($potentialUrl);
                }
                catch(Exception $e)
                {
                    $errors[] = "/pgetinker.cpp:" . $i + 1 . ":1: error: failed to retrieve {$potentialUrl}";
                    $log->info("failed to include remote file: {$potentialUrl} at line: " . $i + 1);
                    continue;
                }
                
                if(
                    !($response->status() >= 200 && $response->status() < 400) ||
                    !str_contains($response->header("Content-Type"), "text/plain")
                )
                {
                    $errors[] = "/pgetinker.cpp:" . $i + 1 . ":1: error: failed to retrieve {$potentialUrl}";
                    $log->info("failed to include remote file: {$potentialUrl} at line: " . $i + 1);
                    continue;                    
                }

                if(intval($response->header("Content-Length")) > 1048576)
                {
                    $errors[] = "/pgetinker.cpp:" . $i + 1 . ":1: error: exceeds 1MB maximum file size";
                    $log->info("remote file: {$potentialUrl} exceeds 1MB file size limitation");
                    continue;
                }

                $log->info("retrieving the body content");

                $response = Http::get($potentialUrl);
                
                // check included source for bad things
                preg_match_all(
                    '/\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/m',
                    $response->body(),
                    $match,
                    PREG_SET_ORDER,
                    0
                );
                
                if(count($match) > 0)
                {
                    $errors[] = "/pgetinker.cpp:" . $i + 1 . ":1: error: found absolute or relative paths in remote file: {$potentialUrl}";
                    $log->info("found absolute or relative paths in remote file: {$potentialUrl}");
                    continue;
                }
                
                $log->info("writing remote file to: {$directoryName}/{$potentialFilename}");
                Storage::put("{$directoryName}/{$potentialFilename}", $response->body());
                
                if(env("COMPILER_CACHING", false))
                {
                    $log->info("copying remote file to cache");
                    Storage::copy("{$directoryName}/{$potentialFilename}", "remoteIncludeCache/{$hashedUrl}");
                }

                $linesOfCode[$i] = '#include "' . $potentialFilename .'"';
                continue;
            }
        }
        
        // bail if we have errors here, no need to invoke the compiler
        if(count($errors) > 0)
        {
            $response = [
                "statusCode" => 400,
                "stdout" => "",
                "stderr" => implode("\n", $errors),
            ];
            
            $log->info("compilation failed");
            return $response;
        }
    
        $version = "v0.01";
        $workspaceDirectory = Storage::path($directoryName);
        $thirdPartyDirectory = base_path() . "/third_party";
    
        $compilerEnvironment = env("COMPILER_ENVIRONMENT", "local");

        $log->info("writing linesOfCode to {$directoryName}/pgetinker.cpp");
        Storage::put("{$directoryName}/pgetinker.cpp", implode("\n", $linesOfCode));

        $environmentVariables = [];
        $compilerCommand = null;
        $linkerCommand = null;

        if($compilerEnvironment === "local")
        {
            $log->info("preparing compiler environment: {$compilerEnvironment}");
            
            $environmentVariables = array_merge($environmentVariables, [
                "EMSDK" => "/opt/emsdk",
                "EMSDK_NODE" => "/opt/emsdk/node/16.20.0_64bit/bin/node",
                "PATH" => "/bin:/usr/bin:/opt/emsdk:/opt/emsdk/upstream/emscripten",
            ]);
    
            symlink("{$thirdPartyDirectory}/{$version}/include", "{$workspaceDirectory}/include");
            symlink("{$thirdPartyDirectory}/{$version}/lib", "{$workspaceDirectory}/lib");
            symlink("{$thirdPartyDirectory}/emscripten_shell.html", "{$workspaceDirectory}/emscripten_shell.html");
            
            $compilerCommand = [];
            $linkerCommand = [];
        }

        if($compilerEnvironment === "nsjail")
        {
            $log->info("preparing compiler environment: {$compilerEnvironment}");

            $nsJailCommand = [
                "nsjail",
                "--config",
                "{$thirdPartyDirectory}/nsjail-emscripten.cfg",
                "-B",
                "{$workspaceDirectory}:/user",
                "-R",
                "{$thirdPartyDirectory}/{$version}/include:/user/include",
                "-R",
                "{$thirdPartyDirectory}/{$version}/lib:/user/lib",
                "-R",
                "{$thirdPartyDirectory}/emscripten_shell.html:/user/emscripten_shell.html",
                "--",
            ];

            $compilerCommand = $nsJailCommand;
            $linkerCommand   = $nsJailCommand;
        }

        if($compilerCommand === null || $linkerCommand === null)
        {
            throw new Exception("unknown compiler environment");
        }

        $log->info("preparing compiler command");
        $compilerCommand = array_merge($compilerCommand, [
            "/opt/emsdk/upstream/emscripten/em++",
            "-c",
            "-I./include/olcPixelGameEngine",
            "-I./include/olcPixelGameEngine/extensions",
            "-I./include/olcPixelGameEngine/utilities",
            "-I./include/olcSoundWaveEngine",
            "pgetinker.cpp",
            "-o",
            "pgetinker.o",
        ]);
        
        $log->info("preparing linker command");
        $linkerCommand = array_merge($linkerCommand, [
            "/opt/emsdk/upstream/emscripten/em++",
            "pgetinker.o",
            ...$libraries,
            "-o",
            "pgetinker.html",
            "--shell-file",
            "./emscripten_shell.html",
            "-sASYNCIFY",
            "-sALLOW_MEMORY_GROWTH=1",
            "-sMAX_WEBGL_VERSION=2",
            "-sMIN_WEBGL_VERSION=2",
            "-sUSE_LIBPNG=1",
            "-sUSE_SDL_MIXER=2",
            "-sLLD_REPORT_UNDEFINED",
            "-sSINGLE_FILE",
        ]);
    
        $log->info("invoking the compiler");
        $compilerProcessResult = Process::env($environmentVariables)
            ->path($workspaceDirectory)
            ->timeout(10)
            ->command($compilerCommand)->run();
        
        if($compilerProcessResult->exitCode() !== 0)
        {
            $response = [
                "statusCode" => 400,
                "stdout" => $this->filterOutput($compilerProcessResult->output()),
                "stderr" => $this->filterOutput($compilerProcessResult->errorOutput()),
            ];
            
            $log->error("compilation failed", [
                "stdout" => $compilerProcessResult->output(),
                "stderr" => $compilerProcessResult->errorOutput(),
            ]);
    
            return $response;
        }
        
        $log->info("invoking the linker");
        $linkerProcessResult = Process::env($environmentVariables)
            ->path($workspaceDirectory)
            ->timeout(10)
            ->command($linkerCommand)->run();
    
        if($linkerProcessResult->exitCode() !== 0)
        {
            $response = [
                "statusCode" => 400,
                "stdout" => $this->filterOutput($linkerProcessResult->output()),
                "stderr" => $this->filterOutput($linkerProcessResult->errorOutput()),
            ];
    
            $log->error("linking failed", [
                "stdout" => $linkerProcessResult->output(),
                "stderr" => $linkerProcessResult->errorOutput(),
            ]);
            
            return $response;
        }
        
        if(Storage::fileMissing("{$directoryName}/pgetinker.html"))
        {
            $response = [
                "statusCode" => 42069,
                "message" => "something really bad up happened in order for this to occur. contact the administrator",
            ];
    
            Log::debug("Compile: failed beyond the linker stage", $response);
            return $response;
        }
    
        // if we've made it here, SUCCESS!
        $html = Storage::read("{$directoryName}/pgetinker.html");
        
        if(env("COMPILER_CACHING", false))
        {
            Storage::move("{$directoryName}/pgetinker.html", "compilerCache/{$hashedCode}");
        }

        Storage::deleteDirectory($directoryName);
        
        return [
            "statusCode" => 200,
            "hash" => $hashedCode,
            "html" => $html,
        ];
    }
    
    function filterOutput($text)
    {
        $text = array_filter(explode("\n", $text), function($value)
        {
            return (strpos($value, "undefined symbol") !== false) ||
                (strpos($value, "duplicate symbol") !== false) ||
                (strpos($value, "pgetinker.cpp") === 0);
        });

        return implode("\n", $text);
    }

}


