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
