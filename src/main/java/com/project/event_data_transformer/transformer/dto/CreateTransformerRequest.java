package com.project.event_data_transformer.transformer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateTransformerRequest(
        @NotBlank String inputTopic,
        @NotBlank String name,
        @NotBlank String outputTopic,
        @NotEmpty List<FieldRuleDto> rules
) {}
