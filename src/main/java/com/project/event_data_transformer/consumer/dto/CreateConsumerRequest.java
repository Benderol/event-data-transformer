package com.project.event_data_transformer.consumer.dto;

public record CreateConsumerRequest(
        String name,
        String topic,
        String groupId,
        boolean enabled
) {
}
