package com.project.event_data_transformer.eventlog;

import com.project.event_data_transformer.eventlog.dto.EventLogResponse;
import com.project.event_data_transformer.eventlog.mappers.EventLogMapper;
import com.project.event_data_transformer.eventlog.models.EventLogModel;
import com.project.event_data_transformer.eventlog.repository.EventLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventLogService {

    private final EventLogRepository repository;

    public List<EventLogResponse> getAll() {
        return repository.findAll().stream()
                .map(e -> new EventLogResponse(e.getType(), e.getInputTopic(), e.getOutputTopic(), e.getMessage(), e.getCreatedAt()))
                .toList();
    }

    @Async
    public void log(EventLogModel model) {
        repository.save(EventLogMapper.to(model));
    }
}
