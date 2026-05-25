package com.project.event_data_transformer.eventlog.dto;

import com.project.event_data_transformer.eventlog.models.EventLogType;

import java.time.LocalDateTime;

public record EventLogResponse(
        EventLogType type,
        String inputTopic,
        String outputTopic,
        String message,
        LocalDateTime createdAt
) {}
