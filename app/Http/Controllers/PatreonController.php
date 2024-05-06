<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PatreonController extends Controller
{
    function update(Request $request)
    {
        $disk = (!empty(env("AWS_BUCKET"))) ? Storage::disk("s3") : Storage::disk("local");

        if(empty(env("PATREON_ACCESS_TOKEN")) || empty(env("PATREON_WEBHOOK_SECRET")))
        {
            Log::error("Error: missing Patreon Access Token or Webhook Secret... aborted.");
            
            return response([
                "statusCode" => 500,
                "message" => "Missing Patreon Access Token or Webhook Secret.",
            ], 500);
        }
        
        $signature = hash_hmac("md5", $request->getContent(), env("PATREON_WEBHOOK_SECRET"));
        if($request->header("X-Patreon-Signature") != $signature)
        {
            Log::alert("Unauthorized webhook request");
            return response([
                "statusCode" => 401,
                "message" => "unauthorized"
            ]);
        }

        $this->getPatreonNames();
        
        return [];
    }

    function getPatreonNames()
    {
        $disk = (!empty(env("AWS_BUCKET"))) ? Storage::disk("s3") : Storage::disk("local");

        Log::info("Getting Patreon Supporters");

        $campaign = Http::withToken(env("PATREON_ACCESS_TOKEN"))
                                ->get("https://www.patreon.com/api/oauth2/v2/campaigns")
                                ->json()["data"][0]["id"];
        
        $cursor = null;
        $keepGoing = true;
        
        $supporters = [];
        while($keepGoing)
        {
            $membersRequest = Http::withToken(env("PATREON_ACCESS_TOKEN"));
            $membersRequest->withQueryParameters([
                "page[count]" => 25,
                "include" => "currently_entitled_tiers",
                "fields[member]" => "full_name,last_charge_date,last_charge_status,currently_entitled_amount_cents,patron_status",
            ]);
            if($cursor != null)
            {
                $membersRequest->withQueryParameters([
                    "page[cursor]" => $cursor,
                ]);
            }
            
            $members = $membersRequest->get("https://www.patreon.com/api/oauth2/v2/campaigns/{$campaign}/members")->json();

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
                    
            $cursor = $members["meta"]["pagination"]["cursors"]["next"];
            if(empty($cursor))
            {
                $keepGoing = false;
            }
        }
        
        $disk->put("supporters.json", json_encode(["supporters" => $supporters]));
    }
}

