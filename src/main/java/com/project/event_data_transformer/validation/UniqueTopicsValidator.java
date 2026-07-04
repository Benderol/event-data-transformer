package com.project.event_data_transformer.validation;

import com.project.event_data_transformer.transformer.dto.CreateTransformerRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UniqueTopicsValidator implements ConstraintValidator<UniqueTopics, CreateTransformerRequest> {

    @Override
    public boolean isValid(CreateTransformerRequest request, ConstraintValidatorContext context) {
        if (request.inputTopic() == null || request.outputTopic() == null) {
            return false;
        }
        return !request.inputTopic().equals(request.outputTopic());
    }
}
