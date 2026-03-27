package com.taskmanager.application.service;

import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.application.model.dto.EventTaskDTO;
import com.taskmanager.application.model.dto.HomeSummaryDTO;
import com.taskmanager.application.model.dto.TaskDTO;
import com.taskmanager.application.model.entities.User;
import com.taskmanager.application.respository.EventTaskRepository;
import com.taskmanager.application.respository.ListRepository;
import com.taskmanager.application.respository.TaskRepository;

@Service
public class HomeService {

    private static final Logger logger = LoggerFactory.getLogger(HomeService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EventTaskRepository eventTaskRepository;

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private AuthService authService;

    @Transactional(readOnly = true)
    public HomeSummaryDTO getHomeSummary() {
        logger.info("Building home summary for current user");

        User user = authService.getCurrentUser();
        logger.debug("Current user: {}", user.getUsername());

        HomeSummaryDTO summary = new HomeSummaryDTO();

        // Recent tasks (last 5, ordered by creation date descending)
        List<TaskDTO> recentTasks = taskRepository
                .findTop5ByUserOrderByCreationDateDesc(user)
                .stream()
                .map(TaskDTO::fromEntity)
                .toList();
        summary.setRecentTasks(recentTasks);
        logger.debug("Found {} recent tasks", recentTasks.size());

        // Next events (next 5 upcoming events from now)
        List<EventTaskDTO> nextEvents = eventTaskRepository
                .findUpcomingEventsByUserId(user.getId(), new Date(), PageRequest.of(0, 5));
        summary.setNextEvents(nextEvents);
        logger.debug("Found {} upcoming events", nextEvents.size());

        // Total counts
        long totalTasks = taskRepository.countByUser(user);
        summary.setTotalTasks(totalTasks);

        long totalLists = listRepository.countByUser(user);
        summary.setTotalLists(totalLists);

        logger.info("Home summary built: {} recent tasks, {} next events, {} total tasks, {} total lists",
                recentTasks.size(), nextEvents.size(), totalTasks, totalLists);

        return summary;
    }
}
