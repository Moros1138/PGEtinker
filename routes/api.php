<?php

use App\Http\Controllers\CodeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/share",   [CodeController::class, "Share" ]);
Route::post("/compile", [CodeController::class, "Compile" ]);

Route::get("model/{version}", function(Request $request, string $version)
{
    if(file_exists(base_path() . "/third_party/{$version}/model.h"))
        return file_get_contents(base_path() . "/third_party/{$version}/model.h");
    
    return response([
        "statusCode" => 404,
        "message" => "Model Version {$version} not found.",
    ], 404);
});

Route::get("/default-code", function(Request $request)
{
    return [
        "code" => file_get_contents(base_path() . '/resources/example.cpp')
    ];
});

Route::get("/news", function(Request $request)
{
    $changeLog = new stdClass();

    $lines = file(base_path() . "/CHANGELOG.md");
    
    $start = 0;
    
    for($i = 0; $i < count($lines); $i++)
    {
        if($start == 0)
        {
            if(strpos($lines[$i], "## ") === 0)
            {
                $start = $i;
                $changeLog->date = trim(str_replace("## ", "", $lines[$i]));
                $changeLog->entries = [];
                continue;
            }
        }
    
        if($start > 0)
        {
            if(strpos($lines[$i], "## ") === 0)
            {
                break;
            }
    
            $tokens = explode(" ", $lines[$i]);
            if($tokens[0] == "-")
            {
                $entry = new stdClass();
                $entry->type = strtolower($tokens[1]);
                
                unset($tokens[0]);
                unset($tokens[1]);
                
                $entry->message = trim(implode(" ", $tokens));
                $changeLog->entries[] = $entry;
            }
        }
    }
    
    return $changeLog;
});