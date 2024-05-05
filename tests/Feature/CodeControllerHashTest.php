<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;

use App\Http\Controllers\CodeController;
use Tests\TestCase;

class CodeControllerHashTest extends TestCase
{
    
    public function test_parenthesis(): void
    {
        $c = new CodeController();

        $this->assertTrue($c->hashCode("(a)") == $c->hashCode("( a)"));
        $this->assertTrue($c->hashCode("(a)") == $c->hashCode("(a )"));
    }
    
    public function test_comma_hash(): void
    {
        $c = new CodeController();
        $this->assertTrue($c->hashCode(",") == $c->hashCode(" ,"));
        $this->assertTrue($c->hashCode(",") == $c->hashCode(", "));
    }

    public function test_comment_hash(): void
    {
        $c = new CodeController();
        $this->assertTrue($c->hashCode("// this is a comment") == $c->hashCode("// this is a longer comment"));
    }

    public function test_string_literal_hash(): void
    {
        $c = new CodeController();
        $this->assertFalse($c->hashCode('"this is a string"') == $c->hashCode('"this is a longer string"'));
    }

    public function test_one_line_macro(): void
    {
        $c = new CodeController();
        $this->assertFalse($c->hashCode("#define SOME_MACRO") == $c->hashCode("#define SOME_NEW_MACRO"));
    }

    public function test_math_operators(): void
    {
        $c = new CodeController();
        foreach(["-", "+", "*"] as $operator)
        {
            $this->assertTrue($c->hashCode("{$operator}") == $c->hashCode(" {$operator}"));
            $this->assertTrue($c->hashCode("{$operator}") == $c->hashCode("{$operator} "));
        }
    }

}
