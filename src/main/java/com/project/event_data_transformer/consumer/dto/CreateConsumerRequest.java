package com.project.event_data_transformer.consumer.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateConsumerRequest(
        @NotBlank String name,
        @NotBlank String topic,
        @NotBlank String groupId,
        boolean enabled
) {
}
