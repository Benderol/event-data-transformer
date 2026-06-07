package com.project.event_data_transformer.testsend;

import jakarta.validation.constraints.NotBlank;

public record TestSendRequest(@NotBlank String topic, @NotBlank String message) {}
