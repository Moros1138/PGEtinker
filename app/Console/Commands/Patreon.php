<?php

namespace App\Console\Commands;

use App\Http\Controllers\PatreonController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class Patreon extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:patreon';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get Patreon Supporters';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if(empty(env("PATREON_ACCESS_TOKEN")))
        {
            Log::error("Error: missing Patreon Access Token... aborted.");
            return;
        }
        
        $controller = new PatreonController();
        $controller->getPatreonNames();

    }
}
