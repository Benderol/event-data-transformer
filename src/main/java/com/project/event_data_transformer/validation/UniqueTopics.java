package com.project.event_data_transformer.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueTopicsValidator.class)
public @interface UniqueTopics {
    String message() default "inputTopic and outputTopic must be different";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
