<?php

namespace App\Http\Controllers;

use App\Models\Code;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

use PGEtinker\Compiler;


use function PGEtinker\Utils\hashCode;

use function PGEtinker\Utils\takeScreenshotOfHtml;
use function PGEtinker\Utils\uploadFileToPit;

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
            $result["shareURL"] = env("APP_URL") . "/s/" . $share->slug;

            if(empty($share->thumb_url))
            {
                Log::info("no thumbnail, try to upload it");
                $share->thumb_url = uploadFileToPit($share->slug . ".png", takeScreenshotOfHtml($result["html"]));
                $share->save();
            }

            $result["shareThumbURL"] = $share->thumb_url;
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
        
        $share->thumb_url = uploadFileToPit($share->slug . ".png", takeScreenshotOfHtml($result["html"]));
        
        if($share->save())
        {
            $result["shareURL"] = env("APP_URL") . "/s/" . $slug;
            $result["shareThumbURL"] = $share->thumb_url;
            unset($result["hash"]);

            return response($result, $result["statusCode"])->header("Content-Type", "application/json");
        }
    
        // bad moon rising
        return response([ "statusCode" => 500, "message" => "some major server malfunction" ], 500)->header("Content-Type", "application/json");
    }

    function HealthCheck()
    {
        $compiler = new Compiler();
        if($compiler->healthCheck())
        {
            return response([
                "statusCode" => 200,
                "message" => "healthy"
            ], 200);
        }

        return response([
            "statusCode" => 400,
            "message" => "unhealthy"
        ], 400);
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
        
        $hashedCode = hashCode($code);
        
        if(env("COMPILER_CACHING", false))
        {
            try
            {
                $cachedCode = Redis::get("compiler_{$hashedCode}");
            
                if(isset($cachedCode))
                {
                    Redis::expire("compiler_{$hashedCode}", env("REDIS_TTL", 60));
                    Log::debug("Compile: cache hit", ["hashedCode" => $hashedCode]);
                    
                    $compiler = new Compiler();
                    $compiler->deserialize($cachedCode);
    
                    return [
                        "statusCode" => $compiler->getStatus(),
                        "hash" => $hashedCode,
                        "html" => $compiler->getHtml(),
                        "stdout" => $compiler->getOutput(),
                        "stderr" => $compiler->getErrorOutput(),
                    ];
                }
            }
            catch(Exception $e)
            {
                Log::emergency("Compiler Caching enabled and Redis failed.");
            }
            
            Log::debug("Compile: cache miss", ["hashedCode" => $hashedCode]);
        }
        
        if(Storage::directoryMissing("workspaces"))
        {
            Storage::makeDirectory("workspaces");
        }

        if(Storage::disk("local")->exists("workspaces"))
        {
            Storage::disk("local")->makeDirectory("workspaces");
        }
            
        $directoryName = "workspaces/" . Str::uuid();
        Storage::disk("local")->makeDirectory($directoryName);
        
        Log::debug("Compile: working directory created {$directoryName}");
        
        $compiler = new Compiler();
        $compiler
            ->setCode($code)
            ->setWorkingDirectory(Storage::disk("local")->path($directoryName));
        
        if($compiler->build())
        {
            if(env("COMPILER_CACHING", false))
            {
                try
                {
                    Redis::setex("compiler_{$hashedCode}", env("REDIS_TTL", 60), $compiler->serialize());
                }
                catch(Exception $e)
                {
                    Log::emergency("Compiler Caching enabled but Redis failed");
                }
            }
                
            return [
                "statusCode" => 200,
                "hash" => $hashedCode,
                "html" => $compiler->getHtml(),
                "stdout" => $compiler->getOutput(),
                "stderr" => $compiler->getErrorOutput(),
            ];
        }

        if(env("COMPILER_CACHING", false))
        {
            try
            {
                Redis::setex("compiler_{$hashedCode}", env("REDIS_TTL", 60), $compiler->serialize());
            }
            catch(Exception $e)
            {
                Log::emergency("Compiler Caching enabled but Redis failed");
            }
        }
    
        return [
            "statusCode" => 400,
            "hash" => $hashedCode,
            "html" => $compiler->getHtml(),
            "stdout" => $compiler->getOutput(),
            "stderr" => $compiler->getErrorOutput(),
        ];
    }
    

}


