package com.project.event_data_transformer.transformer.dto;

import java.util.List;

public record CreateTransformerRequest(
        String inputTopic,
        String name,
        String outputTopic,
        List<FieldRuleDto> rules
) {}
