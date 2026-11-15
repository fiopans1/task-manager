package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.taskmanager.e2e.config.E2EConfig;
import com.taskmanager.e2e.core.BaseTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

/**
 * Verifies that data-driven screens render skeleton placeholders instead of
 * blank panels while their API requests are still in flight.
 */
@Tag("smoke")
class LoadingStatesTest extends BaseTest {

    private static final String TASKS_PAGE_API = "**/api/tasks/tasks/paged**";
    private static final String HOME_SUMMARY_API = "**/api/home-summary**";

    @Test
    void tasksListShowsSkeletonsWhileFetching() {
        loginAsAdmin();

        page.route(TASKS_PAGE_API, route -> {
            pause();
            route.resume();
        });

        page.navigate(E2EConfig.baseUrl() + "/home/tasks");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("My Tasks")))
                .isVisible();
        assertThat(page.locator("[data-slot='skeleton']").first()).isVisible();

        page.unroute(TASKS_PAGE_API);
        assertThat(page.locator("[data-slot='skeleton']")).hasCount(0);
        assertThat(page.getByText("All tasks", new Page.GetByTextOptions().setExact(true))).isVisible();
    }

    @Test
    void dashboardShowsSkeletonStatsWhileSummaryLoads() {
        loginAsAdmin();

        page.route(HOME_SUMMARY_API, route -> {
            pause();
            route.resume();
        });

        page.navigate(E2EConfig.baseUrl() + "/home");
        assertThat(page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Task Manager")))
                .isVisible();
        assertThat(page.locator("[aria-busy='true'] [data-slot='skeleton']").first()).isVisible();

        page.unroute(HOME_SUMMARY_API);
        assertThat(page.locator("[data-slot='skeleton']")).hasCount(0);
        assertThat(page.getByText("Total tasks", new Page.GetByTextOptions().setExact(true)).first())
                .isVisible();
    }

    private static void pause() {
        try {
            Thread.sleep(1200);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
        }
    }
}
