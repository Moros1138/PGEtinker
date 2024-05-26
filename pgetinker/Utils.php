<?php

namespace PGEtinker\Utils;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

function hashCode(string $code)
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

function takeScreenshotOfHtml($html)
{
    if(empty(env("SCREENSHOTTER_URL")))
    {
        Log::error("Error: screenshotter url not set... aborted.");
        return file_get_contents(base_path() . "/resources/images/screenshot-fail.png");
    }
    
    try
    {
        $response = Http::withHeader("Content-Type", "application/json")
                            ->post(env("SCREENSHOTTER_URL"), [
                                "html" => $html,
                            ]);
                            
        if($response->status() != 200)
        {
            Log::debug("Failed to get screenshot. Using failure screenshot.");
            return file_get_contents(base_path() . "/resources/images/screenshot-fail.png");
        }
        
        return $response->body();
    }
    catch(Exception $e)
    {
        Log::error("Failed to get screenshot. Is the screenshot service running?");
        return file_get_contents(base_path() . "/resources/images/screenshot-fail.png");
    }
}

function uploadFileToPit($filename, $content = null)
{
    if($content == null)
    {
        Log::error("Error: missing content.");
        return null;
    }

    if(empty(env("PIT_ACCESS_TOKEN")))
    {
        Log::error("Error: missing Pit Access Token... aborted.");
        return null;
    }

    try
    {
        $response = Http::withHeader("x-api-key", env("PIT_ACCESS_TOKEN"))
                        ->attach($filename, $content, $filename)
                        ->post(env("PIT_URL") . "/api/upload");
        
        Log::debug("upload status: " . $response->status(), ["response" => $response]);

        $fileUrl = $response->json()["url"];
    }
    catch(Exception $e)
    {
        return null;
    }

    return $fileUrl;
}
