<?php

namespace App\Console\Commands;

use App\Http\Controllers\CodeController;
use App\Models\Code;
use Illuminate\Console\Command;

class ComputeCodeHashes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:compute-code-hashes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Computes the hashes of all codes.';
    

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $controller = new CodeController();
        
        $codes = Code::all();
        
        foreach($codes as $code)
        {
            $code->hash = $controller->hashCode($code->code);
            $code->save();
        }

    }
}
