package com.taskmanager.e2e.utils;

public record TeamData(String name, String description) {

    public static TeamData simple(String name) {
        return new TeamData(name, "Description for " + name);
    }
}
