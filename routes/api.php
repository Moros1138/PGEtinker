<?php

use App\Http\Controllers\CodeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/share",   [CodeController::class, "Share" ]);
Route::post("/compile", [CodeController::class, "Compile" ]);

Route::get("/default-code", function(Request $request)
{
    return [
        "code" => file_get_contents(base_path() . '/resources/example.cpp')
    ];
});
