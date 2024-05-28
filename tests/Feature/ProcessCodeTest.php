<?php

namespace Tests\Feature;

use PGEtinker\Compiler;
use Tests\TestCase;

class ProcessCodeTest extends TestCase
{

    public function test_passthru_non_macros(): void
    {
        $compiler = new Compiler();
        
        $code = "I can write anything wheeeee!#define OLC_PGE_APPLICATION\n";
        $compiler->setCode($code);
        $compiler->processCode();
        $this->assertTrue($code == $compiler->getCode());

        $code = "#define OLC_PGE_APPLICATIONYEAAAAAAA\n";
        $compiler->setCode($code);
        $compiler->processCode();
        $this->assertTrue($code == $compiler->getCode());

        $code = "I can write anything wheeeee!#define OLC_PGE_APPLICATIONYEAAAAAAA\n";
        $compiler->setCode($code);
        $compiler->processCode();
        $this->assertTrue($code == $compiler->getCode());
    }
    
    public function test_valid_white_space_macros(): void
    {
        $compiler = new Compiler();

        $code = "\t  #define OLC_PGE_APPLICATION\n";
        $compiler->setCode($code);
        $compiler->processCode();
        print_r($code);
        print_r($compiler->getCode());
        $this->assertTrue($code != $compiler->getCode());

        $code = "#   define OLC_PGE_APPLICATION\n";
        $compiler->setCode($code);
        $compiler->processCode();
        $this->assertTrue($code != $compiler->getCode());

        $code = "#define       OLC_PGE_APPLICATION\n";
        $compiler->setCode($code);
        $compiler->processCode();
        $this->assertTrue($code != $compiler->getCode());
        
        $code = "#define OLC_PGE_APPLICATION      \n";
        $compiler->setCode($code);
        $compiler->processCode();
        $this->assertTrue($code != $compiler->getCode());
    }
    
    // public function test_process_code_fails_on_bad_macro(): void
    // {
    //     $compiler = new Compiler();
        
    //     $code = "I can write anything wheeeee!#define OLC_PGE_APPLICATIONYEAAAAAAA\n";
    //     $compiler->setCode($code);
    //     $compiler->processCode();

    //     $this->assertTrue($code == $compiler->getCode());
    // }

}
