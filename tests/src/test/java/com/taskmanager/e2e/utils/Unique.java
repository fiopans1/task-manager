package com.taskmanager.e2e.utils;

import java.util.UUID;

public final class Unique {

    private Unique() {
    }

    public static String value(String prefix) {
        return "[E2E] " + prefix + " " + UUID.randomUUID().toString().substring(0, 8);
    }

    public static String username(String prefix) {
        return "e2e_" + prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    public static String email(String username) {
        return username + "@example.com";
    }
}
