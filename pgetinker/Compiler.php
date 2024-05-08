<?php

namespace PGEtinker;

use Exception;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Logger;

class Compiler
{
    private $code = [];
    
    private $compilerCommand = [];

    private $compilerExitCode;

    private $environmentVariables = [];

    private $errors = [];
    
    private $html = "";

    private $linkerCommand = [];

    private $linkerExitCode;

    private $linkerInputFiles = [];

    private $logger = null;

    private $output = [];

    private $workingDirectory = "";

    public function __construct()
    {
        $this->logger = new Logger("compiler");
        return $this;
    }

    public function setCode(string $code)
    {
        $this->code = explode("\n", $code);
        return $this;
    }

    public function setWorkingDirectory(string $workingDirectory)
    {
        $this->workingDirectory = $workingDirectory;
        return $this;
    }

    public function getOutput()
    {
        return implode("\n", $this->output);
    }
    
    public function getErrorOutput()
    {
        return implode("\n", $this->errors);
    }

    public function getHtml()
    {
        return $this->html;
    }

    private function processCodeAbsoluteOrRelativePaths($index)
    {
        // filter include macros with an absolute or relative path, naughty naughty
        preg_match(
            '/^\s*#\s*i(nclude|mport)(_next)?\s+["<]((\.{1,2}|\/)[^">]*)[">]/',
            $this->code[$index],
            $match,
            PREG_OFFSET_CAPTURE,
            0
        );

        if(count($match) > 0)
        {
            $this->errors[] = "/pgetinker.cpp:" . $index + 1 . ":1: error: absolute and relative includes are not allowed.";
            $this->logger->info("found absolute or relative path at line " . $index + 1);
            return true;
        }

        return false;
    }
    
    private function processCodeDetectImplementationMacros($index)
    {
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
        
        // filter macros to detect implementation #define
        if(str_contains($this->code[$index], "#define"))
        {
            $foundImplementationMacro = false;
            foreach($libraryMap as $macro => $objectFileName)
            {
                if(str_contains($this->code[$index], $macro))
                {
                    // blank the line
                    $this->code[$index] = "";
                    
                    // indicate that we use this library
                    $this->linkerInputFiles[] = "./lib/{$objectFileName}";
                    
                    $this->logger->info("Found implementation macro: {$macro}");
                    $foundImplementationMacro = true;
                    break;
                }
            }

            if($foundImplementationMacro)
                return true;
        }        
        
        return false;
    }

    private function processCodeRemoteInclude($index)
    {
        preg_match(
            '/^\s*#\s*i(nclude|mport)(_next)?\s+["<](https?:\/\/(.*)[^">]*)[">]/',
            $this->code[$index],
            $match,
            PREG_OFFSET_CAPTURE,
            0
        );

        if(count($match) > 0)
        {
            $this->logger->info("found a potential url for remote include");
            
            $potentialUrl = $match[3][0];
            $potentialFilename = basename($match[3][0]);
            $hashedUrl = hash("sha256", $potentialUrl);

            if(env("COMPILER_REMOTE_INCLUDE_CACHING", false))
            {
                // if we have a cached version of the url's contents, don't pull it
                if(
                    Storage::fileExists("remoteIncludeCache/{$hashedUrl}") &&
                    Storage::fileExists("remoteIncludeCache/{$hashedUrl}.time")
                )
                {
                    $this->logger->info("remote include cache hit");
                    
                    $requestTime = floatval(Storage::get("remoteIncludeCache/{$hashedUrl}.time"));
                    
                    // just because it's cached, doesn't mean you get to compile faster!
                    usleep($requestTime * 1000000);

                    file_put_contents(
                        "{$this->workingDirectory}/{$potentialFilename}",
                        Storage::get("remoteIncludeCache/{$hashedUrl}")
                    );
                    
                    $this->code[$index] = '#include "' . $potentialFilename .'"';
                    return true;
                }
            }
            
            $this->logger->info("remote include cache miss");
            
            try
            {
                $request = new PendingRequest();
                $request->timeout(3);
                $response = $request->head($potentialUrl);
            }
            catch(Exception $e)
            {
                $this->errors[] = "/pgetinker.cpp:" . $index + 1 . ":1: error: failed to retrieve {$potentialUrl}";
                $this->logger->info("failed to include remote file: {$potentialUrl} at line: " . $index + 1, [ "message" => $e->getMessage()]);
                return true;
            }
            
            if(
                !($response->status() >= 200 && $response->status() < 400) ||
                !str_contains($response->header("Content-Type"), "text/plain")
            )
            {
                $this->errors[] = "/pgetinker.cpp:" . $index + 1 . ":1: error: failed to retrieve {$potentialUrl}";
                $this->logger->info("failed to include remote file: {$potentialUrl} at line: " . $index + 1);
                return true;                    
            }

            if(intval($response->header("Content-Length")) > 1048576)
            {
                $this->errors[] = "/pgetinker.cpp:" . $index + 1 . ":1: error: exceeds 1MB maximum file size";
                $this->logger->info("remote file: {$potentialUrl} exceeds 1MB file size limitation");
                return true;
            }

            $this->logger->info("retrieving the body content");

            try
            {
                $requestStartTime = microtime(true);
                
                $request = new PendingRequest();
                $request->timeout(5);
                
                $response = $request->get($potentialUrl);
                
                $requestDuration = microtime(true) - $requestStartTime;
            }
            catch(Exception $e)
            {
                $this->errors[] = "/pgetinker.cpp:" . $index + 1 . ":1: error: failed to retrieve {$potentialUrl}";
                $this->logger->info("failed to include remote file: {$potentialUrl} at line: " . $index + 1);
                return true;
            }                
            
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
                $this->errors[] = "/pgetinker.cpp:" . $index + 1 . ":1: error: found absolute or relative paths in remote file: {$potentialUrl}";
                $this->logger->info("found absolute or relative paths in remote file: {$potentialUrl}");
                return true;
            }
            
            $this->logger->info("writing remote file to: {$this->workingDirectory}/{$potentialFilename}");
            file_put_contents(
                "{$this->workingDirectory}/{$potentialFilename}",
                $response->body()
            );
            
            if(env("COMPILER_REMOTE_INCLUDE_CACHING", false))
            {
                $this->logger->info("caching remotely included source file: $potentialFilename");
                Storage::put("remoteIncludeCache/{$hashedUrl}", $response->body());
                Storage::put("remoteIncludeCache/{$hashedUrl}.time", $requestDuration);
            }

            $this->code[$index] = '#include "' . $potentialFilename .'"';
            return true;
        }
    }
    
    private function processCode()
    {
        $this->logger->info("begin processing code");
        $startTime = microtime(true);

        for($i = 0; $i < count($this->code); $i++)
        {
            $endTime = microtime(true);
            $duration = $endTime - $startTime;

            if($duration > intval(env("COMPILER_CODE_PROCESSING_TIMEOUT", 5)))
            {
                $this->errors[] = "/pgetinker.cpp:" . $i . ":1: error: took too long to process your code, stopped here";
                return false;
            }
                
            if($this->processCodeAbsoluteOrRelativePaths($i))
                continue;

            if($this->processCodeDetectImplementationMacros($i))
                continue;

            if($this->processCodeRemoteInclude($i))
                continue;
        }

        $this->logger->info("finished processing code");
        
        return (count($this->errors) == 0);
    }
    
    private function prepareEnvironment()
    {
        $version = "v0.01";

        $compilerEnvironment = env("COMPILER_ENVIRONMENT", "local");

        $this->logger->info("writing linesOfCode to {$this->workingDirectory}/pgetinker.cpp");
        file_put_contents(
            "{$this->workingDirectory}/pgetinker.cpp",
            implode("\n", $this->code)
        );

        if($compilerEnvironment === "local")
        {
            $this->logger->info("preparing compiler environment: {$compilerEnvironment}");
            
            $this->environmentVariables = array_merge($this->environmentVariables, [
                "EMSDK" => "/opt/emsdk",
                "EMSDK_NODE" => "/opt/emsdk/node/16.20.0_64bit/bin/node",
                "PATH" => "/bin:/usr/bin:/opt/emsdk:/opt/emsdk/upstream/emscripten",
            ]);
    
            symlink(base_path() . "/third_party/{$version}/include", "{$this->workingDirectory}/include");
            symlink(base_path() . "/third_party/{$version}/lib", "{$this->workingDirectory}/lib");
            symlink(base_path() . "/third_party/emscripten_shell.html", "{$this->workingDirectory}/emscripten_shell.html");
        }

        if($compilerEnvironment === "nsjail")
        {
            $this->logger->info("preparing compiler environment: {$compilerEnvironment}");

            $nsJailCommand = [
                "nsjail",
                "--config",
                base_path() . "/third_party/nsjail-emscripten.cfg",
                "-B",
                "{$this->workingDirectory}:/user",
                "-R",
                base_path() . "/third_party/{$version}/include:/user/include",
                "-R",
                base_path() . "/third_party/{$version}/lib:/user/lib",
                "-R",
                base_path() . "/third_party/emscripten_shell.html:/user/emscripten_shell.html",
                "--",
            ];

            $this->compilerCommand = $nsJailCommand;
            $this->linkerCommand   = $nsJailCommand;
        }

        $this->logger->info("preparing compiler command");
        $this->compilerCommand = array_merge($this->compilerCommand, [
            "/opt/emsdk/upstream/emscripten/em++",
            "-c",
            "-I./include/olcPixelGameEngine",
            "-I./include/olcPixelGameEngine/extensions",
            "-I./include/olcPixelGameEngine/utilities",
            "-I./include/olcSoundWaveEngine",
            "pgetinker.cpp",
            "-o",
            "pgetinker.o",
            "-std=c++20",
        ]);
        
        $this->logger->info("preparing linker command");
        $this->linkerCommand = array_merge($this->linkerCommand, [
            "/opt/emsdk/upstream/emscripten/em++",
            "pgetinker.o",
            ...$this->linkerInputFiles,
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
            "-std=c++20",
        ]);
    }

    private function compile()
    {
        $this->logger->info("invoking the compiler");
        
        $didTheThingSuccessfully = false;
        
        try
        {
            $compilerProcessResult = Process::env($this->environmentVariables)
                ->path($this->workingDirectory)
                ->timeout(intval(env("COMPILER_TIMEOUT", 10)))
                ->command($this->compilerCommand)->run();
            
            $this->logger->info("compiler exited with code: " . $compilerProcessResult->exitCode());
            
            $this->compilerExitCode = $compilerProcessResult->exitCode();

            $didTheThingSuccessfully = ($this->compilerExitCode == 0);
            
            $this->output = array_merge(
                $this->output,
                explode("\n", $compilerProcessResult->output())
            );

            $this->errors = array_merge(
                $this->errors,
                explode("\n", $compilerProcessResult->errorOutput())
            );

            if($this->compilerExitCode == 137)
            {
                $this->errors[] = "Compiler Killed (SIGTERM)";
            }
        }
        catch(Exception $e)
        {
            $this->errors[] = "compiler timed out. your code is either broken or there's too much of it!";
            $didTheThingSuccessfully = false;
        }

        return $didTheThingSuccessfully;
    }

    private function link()
    {
        $this->logger->info("invoking the linker");
        
        $didTheThingSuccessfully = false;
        
        try
        {
            $linkerProcessResult = Process::env($this->environmentVariables)
                ->path($this->workingDirectory)
                ->timeout(intval(env("COMPILER_TIMEOUT", 10)))
                ->command($this->linkerCommand)->run();
            
            $this->logger->info("compiler exited with code: " . $linkerProcessResult->exitCode());

            $this->linkerExitCode = $linkerProcessResult->exitCode();
            
            $didTheThingSuccessfully = ($this->linkerExitCode == 0);
            
            $this->output = array_merge(
                $this->output,
                explode("\n", $linkerProcessResult->output())
            );

            $this->errors = array_merge(
                $this->errors,
                explode("\n", $linkerProcessResult->errorOutput())
            );

            if($this->compilerExitCode == 137)
            {
                $this->errors[] = "Linker Killed (SIGTERM)";
            }
        }
        catch(Exception $e)
        {
            $this->errors[] = "linker timed out. your code is either broken or there's too much of it!";
            $didTheThingSuccessfully = false;
        }

        return $didTheThingSuccessfully;
    }
    
    private function cleanUp()
    {
        $this->logger->info("cleanUp called");

        $this->logger->info("OUTPUT:\n\n" . $this->getOutput() . "\n\nERROR:\n\n" . $this->getErrorOutput());

        if(env("FILESYSTEM_DISK") == "s3")
        {
            // convert workingDirectory to laravel disk path
            $prefix = dirname($this->workingDirectory);
            $this->workingDirectory = str_replace("{$prefix}/", "", $this->workingDirectory);

            Log::info("uploading files to remote disk.");
            
            // get the local files
            $files = Storage::disk("local")->files($this->workingDirectory);
        
            // create the s3 directory
            Storage::makeDirectory($this->workingDirectory);
            
            for($i = 0; $i < count($files); $i++)
            {
                // copy the file from the localDisk to the s3
                Storage::put(
                    $files[$i],
                    Storage::disk("local")->get($files[$i])
                );
            }
            
            // remove the local files
            Storage::disk("local")->deleteDirectory($this->workingDirectory);
        }
    }

    public function build()
    {
        if(!file_exists($this->workingDirectory) || !is_dir($this->workingDirectory))
            throw new Exception("Working Directory Inaccessible. Did you set one?");
        
        $logHandler = new StreamHandler("{$this->workingDirectory}/compiler.log");
        $logHandler->setFormatter(new LineFormatter(null, null, true, true));
        
        $this->logger->setHandlers([$logHandler]);

        if(!$this->processCode())
        {
            $this->cleanUp();
            return false;
        }

        $this->prepareEnvironment();

        if(!$this->compile())
        {
            $this->cleanUp();
            return false;
        }

        if(!$this->link())
        {
            $this->cleanUp();
            return false;
        }

        if(file_exists("{$this->workingDirectory}/pgetinker.html"))
        {
            $this->html = file_get_contents("{$this->workingDirectory}/pgetinker.html");
            
            // convert workingDirectory to laravel disk path
            $prefix = dirname($this->workingDirectory);
            $this->workingDirectory = str_replace("{$prefix}/", "", $this->workingDirectory);
            
            Storage::disk("local")->deleteDirectory($this->workingDirectory);

            Log::info("Compile: finished successfully");

            return true;
        }
        
        $this->cleanUp();
        return false;
    }
}