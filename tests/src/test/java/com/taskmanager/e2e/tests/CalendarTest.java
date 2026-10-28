package com.taskmanager.e2e.tests;

import com.microsoft.playwright.Page;
import com.taskmanager.e2e.core.BaseTest;
import com.taskmanager.e2e.pages.CalendarPage;
import com.taskmanager.e2e.pages.TasksPage;
import com.taskmanager.e2e.utils.TaskData;
import com.taskmanager.e2e.utils.Unique;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

class CalendarTest extends BaseTest {

    @Test
    void calendarRendersEventsAndSupportsEveryView() {
        loginAsAdmin();
        String name = Unique.value("calendar views");
        LocalDate date = LocalDate.now().plusDays(1);
        new TasksPage(page).open().createEvent(TaskData.event(name, "Calendar view event"),
                date, "10:00", date, "11:00");

        CalendarPage calendar = new CalendarPage(page).open();
        calendar.expectLegend();

        calendar.view("Week", ".rbc-time-view");
        calendar.expectEvent(name);
        calendar.view("Day", ".rbc-time-view");
        calendar.view("Schedule", ".rbc-agenda-view");
        calendar.view("Month", ".rbc-month-view");

        calendar.navigate("Next");
        calendar.navigate("Prev");
        calendar.clickToday();

        new TasksPage(page).open().deleteTask(name);
    }
}
