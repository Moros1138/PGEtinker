<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;

use Tests\TestCase;
use function PGEtinker\Utils\hashCode;

class UtilsHashCodeTest extends TestCase
{
    
    public function test_parenthesis(): void
    {
        $this->assertTrue(hashCode("(a)") == hashCode("( a)"));
        $this->assertTrue(hashCode("(a)") == hashCode("(a )"));
    }
    
    public function test_comma_hash(): void
    {
        $this->assertTrue(hashCode(",") == hashCode(" ,"));
        $this->assertTrue(hashCode(",") == hashCode(", "));
    }

    public function test_comment_hash(): void
    {
        $this->assertTrue(hashCode("// this is a comment") == hashCode("// this is a longer comment"));
    }

    public function test_string_literal_hash(): void
    {
        $this->assertFalse(hashCode('"this is a string"') == hashCode('"this is a longer string"'));
    }

    public function test_one_line_macro(): void
    {
        $this->assertFalse(hashCode("#define SOME_MACRO") == hashCode("#define SOME_NEW_MACRO"));
    }

    public function test_math_operators(): void
    {
        foreach(["-", "+", "*"] as $operator)
        {
            $this->assertTrue(hashCode("{$operator}") == hashCode(" {$operator}"));
            $this->assertTrue(hashCode("{$operator}") == hashCode("{$operator} "));
        }
    }

}
