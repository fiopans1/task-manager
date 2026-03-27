package com.taskmanager.application.model.dto;
import java.util.ArrayList;
import java.util.List;

public class ResponseDTO { //TO-DO: Change this class
    private int errorCount;
    private int successCount;
    private List<String> errorMessages;
    private List<String> successMessages;


    public ResponseDTO() {
        this.errorCount = 0;
        this.errorMessages = new ArrayList<String>();
        this.successCount = 0;
        this.successMessages = new ArrayList<String>();
    }

    public ResponseDTO(String message, boolean isError) {
        if(isError) {
            this.errorCount = 1;
            this.errorMessages = new ArrayList<String>();
            this.errorMessages.add(message);
        } else {
            this.successCount = 1;
            this.successMessages = new ArrayList<String>();
            this.successMessages.add(message);
        }
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
    public int getSuccessCount() {
        return successCount;
    }
    public List<String> getSuccessMessages() {
        return successMessages;
    }
    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }  
    public void setSuccessMessages(List<String> successMessages) {
        this.successMessages = successMessages;
    }

    public List<String> getErrorMessages() {
        return errorMessages;
    }

    public void addErrorMessage(String errorMessage) {
        if(this.errorMessages == null) {
            this.errorMessages = new ArrayList<String>();
        }
        this.errorMessages.add(errorMessage);
        this.errorCount++;
    }

    public void addSuccessMessage(String successMessage) {
        if(this.successMessages == null) {
            this.successMessages = new ArrayList<String>();
        }
        this.successMessages.add(successMessage);
        this.successCount++;
    }
}


