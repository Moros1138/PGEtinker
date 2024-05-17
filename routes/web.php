<?php

use App\Models\Code;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request)
{
    return view('home', [
        "code" => "",
        
        // TODO: hook sponsor data into some dynamically loading situation.
        "navBarSponsorLink" => "https://www.youtube.com/channel/UC-yuWVUplUJZvieEligKBkA",
        "navBarSponsorText" => "Watch Javidx9, the creator of the olcPixelGameEngine, on Youtube."
    ]);
});

Route::get('/s/{slug}', function(Request $request, string $slug)
{
    $code = Code::where("slug", $slug)->firstOrFail();
    
    $code->view_count++;
    
    $code->save();

    return view("home", [
        "code" => $code->code,
    
        // TODO: hook sponsor data into some dynamically loading situation.
        "navBarSponsorLink" => "https://www.youtube.com/channel/UC-yuWVUplUJZvieEligKBkA",
        "navBarSponsorText" => "Watch Javidx9, the creator of the olcPixelGameEngine, on Youtube."
    ]);
});

Route::get("/disagree", function()
{
    return view("disagree");
});

Route::get("/player", function ()
{
    return view("player");
});
