package com.project.event_data_transformer.transformer.mappers;

import com.project.event_data_transformer.transformer.dto.CreateTransformerRequest;
import com.project.event_data_transformer.transformer.dto.FieldRuleDto;
import com.project.event_data_transformer.transformer.dto.TransformerResponse;
import com.project.event_data_transformer.transformer.models.FieldRuleEntity;
import com.project.event_data_transformer.transformer.models.TransformerEntity;

public class TransformerMapper {

    public static TransformerEntity to(CreateTransformerRequest request) {
        var entity = new TransformerEntity();
        entity.setName(request.name());
        entity.setInputTopic(request.inputTopic());
        entity.setOutputTopic(request.outputTopic());
        entity.setRules(request.rules().stream().map(TransformerMapper::toFieldRule).toList());
        return entity;
    }

    public static TransformerResponse from(TransformerEntity entity) {
        var rules = entity.getRules().stream().map(TransformerMapper::fromFieldRule).toList();
        return new TransformerResponse(entity.getId(), entity.getName(), entity.getInputTopic(), entity.getOutputTopic(), entity.isEnabled(), entity.getCreatedAt(), rules);
    }

    private static FieldRuleEntity toFieldRule(FieldRuleDto dto) {
        var rule = new FieldRuleEntity();
        rule.setFieldName(dto.fieldName());
        rule.setType(dto.type());
        rule.setTargetName(dto.targetName());
        rule.setFromFormat(dto.fromFormat());
        rule.setToFormat(dto.toFormat());
        return rule;
    }

    private static FieldRuleDto fromFieldRule(FieldRuleEntity entity) {
        return new FieldRuleDto(entity.getFieldName(), entity.getType(), entity.getTargetName(), entity.getFromFormat(), entity.getToFormat());
    }
}
