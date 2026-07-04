package com.project.event_data_transformer.transformer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.event_data_transformer.eventlog.EventLogService;
import com.project.event_data_transformer.eventlog.models.EventLogModel;
import com.project.event_data_transformer.eventlog.models.EventLogType;
import com.project.event_data_transformer.transformer.models.FieldRuleEntity;
import com.project.event_data_transformer.transformer.models.TransformationType;
import com.project.event_data_transformer.transformer.models.TransformerEntity;
import com.project.event_data_transformer.transformer.repository.DataTransformerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProducerServiceTest {

    @Mock
    private DataTransformerRepository transformerRepository;
    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;
    @Mock
    private EventLogService eventLogService;

    private ProducerService producerService;

    @BeforeEach
    void setUp() {
        producerService = new ProducerService(transformerRepository, kafkaTemplate, new ObjectMapper(), eventLogService);
    }

    @Test
    void testTransformerWithIncludeRule() throws Exception {
        var transformer = transformer("input-topic", "output-topic", includeRule("name"));
        when(transformerRepository.findAllByInputTopicAndEnabledTrue("input-topic")).thenReturn(List.of(transformer));

        producerService.produce("input-topic", "{\"name\":\"John\",\"age\":30}");

        var log = captureLog();
        assertThat(log.type()).isEqualTo(EventLogType.PRODUCER);
        assertThat(log.inputTopic()).isEqualTo("input-topic");
        assertThat(log.outputTopic()).isEqualTo("output-topic");
        assertThat(log.message()).contains("\"name\":\"John\"");
        assertThat(log.message()).doesNotContain("\"age\"");
    }

    @Test
    void testTransformerWithRenameRule() throws Exception {
        var transformer = transformer("input-topic", "output-topic", renameRule("name", "fullName"));
        when(transformerRepository.findAllByInputTopicAndEnabledTrue("input-topic")).thenReturn(List.of(transformer));

        producerService.produce("input-topic", "{\"name\":\"John\"}");

        var log = captureLog();
        assertThat(log.type()).isEqualTo(EventLogType.PRODUCER);
        assertThat(log.message()).contains("\"fullName\":\"John\"");
        assertThat(log.message()).doesNotContain("\"name\"");
    }

    @Test
    void testTransformerWithDataFormatRule() throws Exception {
        var transformer = transformer("input-topic", "output-topic", formatDateRule("date", "yyyy-MM-dd", "dd/MM/yyyy"));
        when(transformerRepository.findAllByInputTopicAndEnabledTrue("input-topic")).thenReturn(List.of(transformer));

        producerService.produce("input-topic", "{\"date\":\"2024-01-15\"}");

        var log = captureLog();
        assertThat(log.type()).isEqualTo(EventLogType.PRODUCER);
        assertThat(log.message()).contains("\"date\":\"15/01/2024\"");
    }

    @Test
    void testTransformerWithInvalidRule() {
        var transformer = transformer("input-topic", "output-topic", includeRule("name"));
        when(transformerRepository.findAllByInputTopicAndEnabledTrue("input-topic")).thenReturn(List.of(transformer));

        producerService.produce("input-topic", "not-valid-json");

        verify(eventLogService, never()).log(any());
    }

    private EventLogModel captureLog() {
        var captor = ArgumentCaptor.forClass(EventLogModel.class);
        verify(eventLogService).log(captor.capture());
        return captor.getValue();
    }

    private TransformerEntity transformer(String inputTopic, String outputTopic, FieldRuleEntity... rules) {
        var entity = new TransformerEntity();
        entity.setInputTopic(inputTopic);
        entity.setOutputTopic(outputTopic);
        entity.setRules(List.of(rules));
        return entity;
    }

    private FieldRuleEntity includeRule(String fieldName) {
        var rule = new FieldRuleEntity();
        rule.setFieldName(fieldName);
        rule.setType(TransformationType.INCLUDE);
        return rule;
    }

    private FieldRuleEntity renameRule(String fieldName, String targetName) {
        var rule = new FieldRuleEntity();
        rule.setFieldName(fieldName);
        rule.setType(TransformationType.RENAME);
        rule.setTargetName(targetName);
        return rule;
    }

    private FieldRuleEntity formatDateRule(String fieldName, String fromFormat, String toFormat) {
        var rule = new FieldRuleEntity();
        rule.setFieldName(fieldName);
        rule.setType(TransformationType.FORMAT_DATE);
        rule.setFromFormat(fromFormat);
        rule.setToFormat(toFormat);
        return rule;
    }
}
