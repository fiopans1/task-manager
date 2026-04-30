package com.taskmanager.application.controller;

import java.util.HashMap;

public final class ApiResponseUtils {

    private ApiResponseUtils() {
    }

    public static HashMap<String, String> errorResponse(String message) {
        HashMap<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }
}
