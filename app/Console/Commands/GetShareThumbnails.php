<?php

namespace App\Console\Commands;

use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

use function PGEtinker\Utils\takeScreenshotOfHtml;
use function PGEtinker\Utils\uploadFileToPit;
use App\Http\Controllers\CodeController;
use App\Models\Code;

class GetShareThumbnails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:get-share-thumbnails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Grab share thumbnails for any share that lacks one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        
    }        
}
