package com.project.event_data_transformer.eventlog;

import com.project.event_data_transformer.eventlog.dto.EventLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/event-logs")
@RequiredArgsConstructor
public class EventLogController {

    private final EventLogService eventLogService;

    @GetMapping
    public List<EventLogResponse> getAll() {
        return eventLogService.getAll();
    }
}
