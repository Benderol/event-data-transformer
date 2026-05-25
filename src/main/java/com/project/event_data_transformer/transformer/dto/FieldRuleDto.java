package com.project.event_data_transformer.transformer.dto;

import com.project.event_data_transformer.transformer.models.TransformationType;

public record FieldRuleDto(
        String fieldName,
        TransformationType type,
        String targetName,
        String fromFormat,
        String toFormat
) {}
