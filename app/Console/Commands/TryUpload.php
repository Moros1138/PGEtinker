<?php

namespace App\Console\Commands;

use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use Facebook\WebDriver\Chrome\ChromeOptions;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Facebook\WebDriver\Remote\RemoteWebDriver;


class TryUpload extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:upload';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Try Upload Stuff';

    /**
     * Execute the console command.
     */
    public function handle()
    {




        echo "Hello\n";
        return;


        if(empty(env("PIT_ACCESS_TOKEN")))
        {
            Log::error("Error: missing Pit Access Token... aborted.");
            return;
        }
        
        $filePath = base_path() . "/public/images/PGEtinker-screenshot.png";
        $fileContent = file_get_contents($filePath);
        
        try
        {
            $response = Http::withHeader("x-api-key", env("PIT_ACCESS_TOKEN"))
                            ->attach(basename($filePath), $fileContent, basename($filePath))
                            ->post(env("PIT_URL") . "/api/upload")
                            ->json();
            $imageId = $response["uuid"];
        }
        catch(Exception $e)
        {
            return;
        }
        

        try
        {
            $response = Http::withHeader("x-api-key", env("PIT_ACCESS_TOKEN"))
                            ->withQueryParameters([
                                "search" => "Screenshots"
                            ])
                            ->get(env("PIT_URL") . "/api/albums")
                            ->json();
            
            if(count($response["albums"]) == 0)
                return;
        
            $albumId = $response["albums"][0]["uuid"];
        }
        catch(Exception $e)
        {
            return;
        }

        
        try
        {
            $response = Http::withHeader("x-api-key", env("PIT_ACCESS_TOKEN"))
                            ->post(env("PIT_URL") . "/api/files/album/{$albumId}", [
                                "files" => [
                                    $imageId,
                                ]
                            ])
                            ->json();
        }
        catch(Exception $e)
        {
            return;
        }
        
        print_r($response);
    }
}
