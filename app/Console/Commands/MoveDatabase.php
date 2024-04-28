<?php

namespace App\Console\Commands;

use App\Models\Code;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MoveDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:move-database';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        $codes = DB::connection('development')->select("SELECT * FROM codes;");
        for($i = 0; $i < count($codes); $i++)
        {
            $code = new Code();
            $code->slug = $codes[$i]->slug;
            $code->code = $codes[$i]->code;
            $code->hash = $codes[$i]->hash;
            $code->save();
        }
    }
}
