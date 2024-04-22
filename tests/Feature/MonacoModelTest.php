<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;

use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class MonacoModelTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_monaco_model_fails_to_load_non_existent_model(): void
    {
        $response = $this->get("/api/model/version-not-exist");
        
        $response->assertStatus(404);
        
    }
    
    public function test_monaco_model_loads_v_0_01(): void
    {
        $response = $this->get("/api/model/v0.01");
        
        $response->assertStatus(200);
    }
}
