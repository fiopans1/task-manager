package com.taskmanager.e2e.utils;

public record TaskData(String name, String description, String priority, String status) {

    public static TaskData simple(String name) {
        return new TaskData(name, "Description for " + name, "MEDIUM", "NEW");
    }

    public static TaskData event(String name, String description) {
        return new TaskData(name, description, "HIGH", "IN_PROGRESS");
    }
}
