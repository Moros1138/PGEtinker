<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use PGEtinker\Compiler;
use Tests\TestCase;

class CompilerTest extends TestCase
{

    public function test_compiler_exists(): void
    {
        if(Storage::disk("local")->exists(__FUNCTION__))
            Storage::disk("local")->deleteDirectory(__FUNCTION__);

        Storage::disk("local")->makeDirectory(__FUNCTION__);
        $workingDirectory = Storage::disk("local")->path(__FUNCTION__);
        $testSourceDirectory = __DIR__ . "/compiler-test-source";

        $compiler = new Compiler();
        $this->assertTrue($compiler->healthCheck());
        Storage::disk("local")->deleteDirectory(__FUNCTION__);
    }
    
    public function test_compiler_builds_hello_world(): void
    {
        if(Storage::disk("local")->exists(__FUNCTION__))
            Storage::disk("local")->deleteDirectory(__FUNCTION__);

        Storage::disk("local")->makeDirectory(__FUNCTION__);
        $workingDirectory = Storage::disk("local")->path(__FUNCTION__);
        $testSourceDirectory = __DIR__ . "/compiler-test-source";

        $compiler = new Compiler();
        $compiler->setWorkingDirectory($workingDirectory);
        $compiler->setCode(file_get_contents("{$testSourceDirectory}/hello-world.cpp"));
        
        $this->assertTrue($compiler->build());
        
        Storage::disk("local")->deleteDirectory(__FUNCTION__);
    }

    public function test_compiler_build_memory_ice_killer(): void
    {
        if(Storage::disk("local")->exists(__FUNCTION__))
            Storage::disk("local")->deleteDirectory(__FUNCTION__);
        
        Storage::disk("local")->makeDirectory(__FUNCTION__);
        $workingDirectory = Storage::disk("local")->path(__FUNCTION__);
        $testSourceDirectory = __DIR__ . "/compiler-test-source";
        
        $compiler = new Compiler();
        $compiler->setWorkingDirectory($workingDirectory);
        $compiler->setCode(file_get_contents("{$testSourceDirectory}/ice-timeout.cpp"));
        
        $this->assertFalse($compiler->build());
        
        Storage::disk("local")->deleteDirectory(__FUNCTION__);
    }

    public function test_compiler_builds_example(): void
    {
        if(Storage::disk("local")->exists(__FUNCTION__))
            Storage::disk("local")->deleteDirectory(__FUNCTION__);
        
        Storage::disk("local")->makeDirectory(__FUNCTION__);
        $workingDirectory = Storage::disk("local")->path(__FUNCTION__);
        $testSourceDirectory = __DIR__ . "/compiler-test-source";
        
        $compiler = new Compiler();
        $compiler->setWorkingDirectory($workingDirectory);
        $compiler->setCode(file_get_contents("{$testSourceDirectory}/example.cpp"));

        $this->assertTrue($compiler->build());

        Storage::disk("local")->deleteDirectory(__FUNCTION__);
    }
    
    public function test_compiler_absolute_and_relative_include_trap(): void
    {
        if(Storage::disk("local")->exists(__FUNCTION__))
            Storage::disk("local")->deleteDirectory(__FUNCTION__);

        Storage::disk("local")->makeDirectory(__FUNCTION__);
        $workingDirectory = Storage::disk("local")->path(__FUNCTION__);
        $testSourceDirectory = __DIR__ . "/compiler-test-source";

        $compiler = new Compiler();
        $compiler->setWorkingDirectory($workingDirectory);
        $compiler->setCode(file_get_contents("{$testSourceDirectory}/absolute-or-relative.cpp"));
        
        $this->assertFalse($compiler->build());

        Storage::disk("local")->deleteDirectory(__FUNCTION__);
    }

    public function test_remote_includes(): void
    {
        if(Storage::disk("local")->exists(__FUNCTION__))
            Storage::disk("local")->deleteDirectory(__FUNCTION__);

        Storage::disk("local")->makeDirectory(__FUNCTION__);
        $workingDirectory = Storage::disk("local")->path(__FUNCTION__);
        $testSourceDirectory = __DIR__ . "/compiler-test-source";

        $compiler = new Compiler();
        $compiler->setWorkingDirectory($workingDirectory);
        $compiler->setCode(file_get_contents("{$testSourceDirectory}/remote-includes.cpp"));
        
        $this->assertTrue($compiler->build());

        Storage::disk("local")->deleteDirectory(__FUNCTION__);
    }

}
