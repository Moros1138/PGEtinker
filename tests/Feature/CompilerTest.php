<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Http\Controllers\CodeController;
use Tests\TestCase;

class CompilerTest extends TestCase
{
    
    public function test_code_hash(): void
    {
        $controller = new CodeController();

        $a1 = $controller->hashCode("(0,0,0)");
        $b1 = $controller->hashCode("( 0,0,0)");
        
        $a2 = $controller->hashCode("(0,0,0)");
        $b2 = $controller->hashCode("(0 ,0,0)");
        
        $a3 = $controller->hashCode("(0,0,0)");
        $b3 = $controller->hashCode("(0,0 ,0)");
        
        $a4 = $controller->hashCode("(0,0,0)");
        $b4 = $controller->hashCode("(0, 0,0)");

        $a5 = $controller->hashCode("(0,0,0)");
        $b5 = $controller->hashCode("(0,0,0 )");
        
        $a6 = $controller->hashCode("(0,0,0)");
        $b6 = $controller->hashCode("(0,0, 0)");

        $this->assertTrue($a1 == $b1);
        $this->assertTrue($a2 == $b2);
        $this->assertTrue($a3 == $b3);
        $this->assertTrue($a4 == $b4);
        $this->assertTrue($a5 == $b5);
        $this->assertTrue($a6 == $b6);
    }
    
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
