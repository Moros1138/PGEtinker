<?php

use App\Models\Code;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    return view('home', ["code" => ""]);
});

Route::get('/s/{slug}', function(Request $request, string $slug)
{
    $code = Code::where("slug", $slug)->firstOrFail();
    return view("home", ["code" => $code->code]);
});

Route::get('/player', function () {
    return view('player');
});
