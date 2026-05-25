package com.project.event_data_transformer.transformer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.project.event_data_transformer.eventlog.EventLogService;
import com.project.event_data_transformer.eventlog.models.EventLogModel;
import com.project.event_data_transformer.eventlog.models.EventLogType;
import com.project.event_data_transformer.transformer.models.FieldRuleEntity;
import com.project.event_data_transformer.transformer.repository.DataTransformerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProducerService {

    private final DataTransformerRepository transformerRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final EventLogService eventLogService;

    @Transactional(readOnly = true)
    public void produce(String inputTopic, String message) {
        var transformers = transformerRepository.findAllByInputTopicAndEnabledTrue(inputTopic);
        if (transformers.isEmpty()) {
            return;
        }
        for (var transformer : transformers) {
            try {
                var source = (ObjectNode) objectMapper.readTree(message);
                var transformedMessage = objectMapper.createObjectNode();

                for (var rule : transformer.getRules()) {
                    applyRule(rule, source, transformedMessage);
                }

                var kafkaMessage = objectMapper.writeValueAsString(transformedMessage);

                log.info("Transformer [{}] sending to '{}': {}", transformer.getId(), transformer.getOutputTopic(), kafkaMessage);
                kafkaTemplate.send(transformer.getOutputTopic(), kafkaMessage);

                var eventLog = new EventLogModel(EventLogType.CONSUMER, inputTopic, transformer.getOutputTopic(), kafkaMessage);
                eventLogService.log(eventLog);
            } catch (Exception e) {
                log.error("Transformer [{}] failed: {}", transformer.getId(), e.getMessage());
            }
        }
    }

    private void applyRule(FieldRuleEntity rule, ObjectNode source, ObjectNode result) {
        var fieldName = rule.getFieldName();

        switch (rule.getType()) {
            case INCLUDE -> {
                if (source.has(fieldName)) {
                    result.set(fieldName, source.get(fieldName));
                } else {
                    log.error("Field '{}' not found in message, skipping", fieldName);
                }
            }
            case RENAME -> {
                if (source.has(fieldName)) {
                    result.set(rule.getTargetName(), source.get(fieldName));
                } else {
                    log.error("Field '{}' not found in message, skipping rename", fieldName);
                }
            }
            case FORMAT_DATE -> {
                if (source.has(fieldName)) {
                    var formatted = reformatDate(source.get(fieldName).asText(), rule.getFromFormat(), rule.getToFormat());
                    result.set(fieldName, TextNode.valueOf(formatted));
                } else {
                    log.error("Field '{}' not found in message, skipping date format", fieldName);
                }
            }
        }
    }

    private String reformatDate(String value, String fromFormat, String toFormat) {
        try {
            var from = DateTimeFormatter.ofPattern(fromFormat);
            var to = DateTimeFormatter.ofPattern(toFormat);
            try {
                return LocalDateTime.parse(value, from).format(to);
            } catch (Exception e) {
                return LocalDate.parse(value, from).format(to);
            }
        } catch (Exception e) {
            log.error("Failed to reformat date '{}' from '{}' to '{}': {}", value, fromFormat, toFormat, e.getMessage());
            return value;
        }
    }
}
