package com.project.event_data_transformer.transformer.dto;

import java.time.LocalDateTime;
import java.util.List;

public record TransformerResponse(
        String name,
        String inputTopic,
        String outputTopic,
        boolean enabled,
        LocalDateTime createdAt,
        List<FieldRuleDto> rules
) {
}
