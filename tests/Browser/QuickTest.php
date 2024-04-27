<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class QuickTest extends DuskTestCase
{
    
    public function testFirstLoadShowsTermsOfUseDisclosure(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/")
                ->assertSee("I Agree")
                ->assertSee("I Disagree");
        });
    }

    public function testDisagreeLeadsToBackupLandingPage(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/")
                ->assertSee("I Agree")
                ->assertSee("I Disagree");
            
            $browser->click("#i-disagree");
            $browser->assertPathIs("/disagree");
        });
    }

    public function testAgreeRevealsTheApplication(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/")
                ->assertSee("I Agree")
                ->assertSee("I Disagree");
            
            $browser->click("#i-agree");
            $browser->assertSee("C++ Editor");
            $browser->assertSee("Emscripten Player");
        });
    }


    public function testLoadsDefaultCodeOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            
            $browser->mouseover("@settings-menu");
            $browser->click("#default-code");
            $browser->assertSee("Hello, PGE");
        });
    }
    
    public function testTogglesThemeOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            
            $browser->mouseover("@settings-menu");
            $browser->click("#toggle-theme");
            $browser->assertAttributeContains("", "class", "light");
        });
    }

    public function testCompilesOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");

            $browser->click("#compile");
            $browser->waitFor("#player-panel .iframe-container iframe", 10);
            $browser->assertPresent("#player-panel .iframe-container iframe");
        });
    }

    public function testSharesOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            
            $browser->mouseover("@sharing-menu");
            $browser->click("#share");
            $browser->waitFor(".share-dialog");

            $shareUrl = $browser->value("#share-url");
            $browser->visit($shareUrl);
            $browser->assertSee("C++ Editor");
            $browser->assertSee("Emscripten Player");
        });
    }
}
