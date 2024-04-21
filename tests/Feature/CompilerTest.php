<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompilerTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_compiler_compiles_hello_world(): void
    {
        $response = $this->post("/api/compile", [
            "code" => '#include <stdio.h> int main() { printf("Hello, World\n"); return 0; }'
        ]);

        $response->assertStatus(200);
    }
    
}
