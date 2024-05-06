<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MoveDatabase extends Command
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
        $disk = (!empty(env("AWS_BUCKET"))) ? Storage::disk("s3") : Storage::disk("local");

        if(empty(env("PATREON_ACCESS_TOKEN")))
        {
            Log::error("Error: missing Patreon Access Token... aborted.");
            return;
        }
        
        Log::info("Updating Patreon Supporters");

        $campaign = Http::withToken(env("PATREON_ACCESS_TOKEN"))
                                ->get("https://www.patreon.com/api/oauth2/v2/campaigns")
                                ->json()["data"][0]["id"];
        
        $members = Http::withToken(env("PATREON_ACCESS_TOKEN"))
                                ->withQueryParameters([
                                    "include" => "currently_entitled_tiers",
                                    "fields[member]" => "full_name,last_charge_date,last_charge_status,currently_entitled_amount_cents,patron_status",
                                    // "fields[tier]" => "amount_cents",
                                ])
                                ->get("https://www.patreon.com/api/oauth2/v2/campaigns/{$campaign}/members")
                                ->json();
        
        $supporters = [];
        if(count($members["data"]) > 0)
        {
            foreach($members["data"] as $member)
            {
                if($member["attributes"]["currently_entitled_amount_cents"] >= 500)
                {
                    if(!empty($member["attributes"]["full_name"]))
                    {
                        $supporters[] = [
                            "amount" => $member["attributes"]["currently_entitled_amount_cents"],
                            "name" => $member["attributes"]["full_name"],
                        ];
                    }
                }
            }
        }

        if($disk->exists("supporters.json"))
            $disk->delete("supporters.json");
        
        $disk->put("supporters.json", json_encode(["supporters" => $supporters]));

    }
}
