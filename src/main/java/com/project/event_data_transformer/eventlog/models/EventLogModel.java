package com.project.event_data_transformer.eventlog.models;

public record EventLogModel(
        EventLogType type,
        String inputTopic,
        String outputTopic,
        String message
) {

}
