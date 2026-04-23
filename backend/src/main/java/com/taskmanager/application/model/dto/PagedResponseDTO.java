package com.taskmanager.application.model.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public class PagedResponseDTO<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public PagedResponseDTO() {
    }

    public static <T> PagedResponseDTO<T> from(Page<T> page) {
        PagedResponseDTO<T> dto = new PagedResponseDTO<>();
        dto.content = page.getContent();
        dto.page = page.getNumber();
        dto.size = page.getSize();
        dto.totalElements = page.getTotalElements();
        dto.totalPages = page.getTotalPages();
        dto.first = page.isFirst();
        dto.last = page.isLast();
        return dto;
    }

    public List<T> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public boolean isLast() {
        return last;
    }
}
