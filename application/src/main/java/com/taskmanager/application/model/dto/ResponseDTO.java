package com.taskmanager.application.model.dto;
import java.util.ArrayList;
import java.util.List;

public class ResponseDTO { //TO-DO: Change this class
    private int errorCount;
    private List<String> errorMessages;

    public ResponseDTO() {
        this.errorCount = 0;
        this.errorMessages = new ArrayList<String>();
    }

    public ResponseDTO(String errorMessage) {
        this.errorCount = 1;
        this.errorMessages = new ArrayList<String>();
        this.errorMessages.add(errorMessage);
    }

    public int getErrorCount() {
        return errorCount;
    }
    public void setErrorCount(int errorCount) {
        this.errorCount = errorCount;
    }
    public void setErrorMessages(List<String> errorMessages) {
        this.errorMessages = errorMessages;
    }

    public List<String> getErrorMessages() {
        return errorMessages;
    }

    public void addErrorMessage(String errorMessage) {
        this.errorMessages.add(errorMessage);
        this.errorCount++;
    }
}


