package com.project.event_data_transformer.transformer.models;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class FieldRuleEntity {

    private String fieldName;

    @Enumerated(EnumType.STRING)
    private TransformationType type;

    // RENAME
    private String targetName;

    // FORMAT_DATE
    private String fromFormat;
    private String toFormat;
}
