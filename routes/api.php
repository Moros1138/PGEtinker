<?php

use App\Http\Controllers\CodeController;
use App\Http\Controllers\PatreonController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/share",   [CodeController::class, "Share" ]);
Route::post("/compile", [CodeController::class, "Compile" ]);
Route::get("/health-check", [CodeController::class, "HealthCheck" ]);

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
    
            $lines[$i] = preg_replace(
                '/\[(.*)\]\((.*)\)/',
                "<a href=\"$2\" target=\"_blank\">$1</a>",
                $lines[$i],
                1
            );

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

Route::get("/supporters", [PatreonController::class, "get_supporters" ]);
Route::post("/update-supporters", [PatreonController::class, "update" ]);
