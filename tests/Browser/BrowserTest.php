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
            
            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");
            
            $browser->assertSee("News and Updates");
        });
    }

    public function testDismissesNewsAndUpdates(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");

            $browser->click(".footer .ok");
            $browser->waitUntilMissing(".dialog");
            
            $browser->assertNotPresent(".dialog");
        });
    }

    public function testLoadsExampleCodeOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");
            
            $browser->click("@examples-menu");
            
            $browser->waitFor("@examples-menu .submenu");
            $browser->click('a[data-code-id="code1"]');

            $browser->waitFor(".toastify");
            $browser->waitUntilMissing(".toastify");

            $browser->assertSee('Example');
        });
    }
    
    public function testSelectsLightTheme(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");

            $browser->click("@settings-menu");
            $browser->waitFor(".settings-dialog");

            $browser->assertPresent('select[name="select-2"]');
            $browser->click('select[name="select-2"]');
            
            $browser->waitFor('option[value="light"]');
            $browser->click('option[value="light"]');

            $browser->waitFor(".toastify");
            $browser->waitUntilMissing(".toastify");

            $browser->click(".footer .ok");
            $browser->waitUntilMissing(".dialog");

            $browser->waitUntil("document.body.classList.contains('light')");
            $browser->assertAttributeContains("", "class", "light");
        });
    }

    public function testCompilesOnClick(): void
    {
        $this->browse(function(Browser $browser)
        {
            $browser->visit("/");
            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");

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
            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");

            $browser->mouseover("@sharing-menu");
            $browser->click("#share");
            $browser->waitFor(".share-dialog", 15);

            $shareUrl = $browser->value("#share-url");
            $browser->visit($shareUrl);

            $browser->waitUntilMissing("#pgetinker-loading", 10);
            $browser->assertMissing("#pgetinker-loading");

            $browser->assertSee("C++ Editor");
        });
    }
}
