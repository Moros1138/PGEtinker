<?php

namespace Tests\Browser;

use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

class BrowserTest extends DuskTestCase
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
            
            $browser->waitUntilMissing("#pgetinker-loading");
            
            $browser->assertSee("News and Updates");
        });
    }

    public function testDismissesNewsAndUpdates(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading");

            $browser->click(".news .content");
            $browser->waitUntilMissing(".news");
            
            $browser->assertNotPresent(".news");
        });
    }

    public function testLoadsDefaultCodeOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading");
            
            $browser->mouseover("@settings-menu");
            $browser->click("#default-code");
            $browser->pause(100);
            $browser->assertSee("class Example : public olc::PixelGameEngine");
        });
    }
    
    public function testTogglesThemeOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading");

            $browser->mouseover("@settings-menu");
            $browser->click("#toggle-theme");
            
            $browser->waitUntil("document.body.classList.contains('light')");
            $browser->assertAttributeContains("", "class", "light");
        });
    }

    public function testCompilesOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading");

            $browser->click("#start-stop");
            $browser->waitFor("#player-panel .iframe-container iframe", 10);
            $browser->assertPresent("#player-panel .iframe-container iframe");
        });
    }

    public function testSharesOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading");

            $browser->mouseover("@sharing-menu");
            $browser->click("#share");
            $browser->waitFor(".share-dialog");

            $shareUrl = $browser->value("#share-url");
            $browser->visit($shareUrl);
            $browser->assertSee("C++ Editor");
        });
    }
}
