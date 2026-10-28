package com.taskmanager.e2e.utils;

public record ListData(String name, String description, String color) {

    public static ListData simple(String name) {
        return new ListData(name, "Description for " + name, "#0d6efd");
    }

    public static ListData withLongDescription(String name) {
        return new ListData(name, "A".repeat(140), "#198754");
    }
}
