package com.project.event_data_transformer.consumer.dto;

import java.time.LocalDateTime;

public record ConsumerResponse(
        Long id,
        String name,
        String topic,
        String groupId,
        LocalDateTime createdAt,
        boolean enabled
) {
}
