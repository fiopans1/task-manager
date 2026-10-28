package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

@Tag("slow")
class SessionTest extends BaseTest {

    @Test
    void idleSessionCanBeExtendedAndThenExpires() {
        page.clock().install();
        loginAsAdmin();

        page.clock().fastForward(10 * 60 * 1000 + 5_000);
        Locator idleDialog = page.getByRole(AriaRole.DIALOG)
                .filter(new Locator.FilterOptions().setHasText("Still There?"));
        assertThat(idleDialog).isVisible();

        idleDialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions()
                .setName("Extend Session")).click();
        assertThat(page.locator("[data-sonner-toast]")
                .filter(new Locator.FilterOptions().setHasText("Session extended successfully"))).isVisible();
        assertThat(idleDialog).hasCount(0);

        page.clock().fastForward(10 * 60 * 1000 + 5_000);
        assertThat(idleDialog).isVisible();
        page.clock().runFor(61_000);

        page.waitForURL(E2EConfig.baseUrl() + "/");
        assertThat(page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in"))).isVisible();
    }
}
