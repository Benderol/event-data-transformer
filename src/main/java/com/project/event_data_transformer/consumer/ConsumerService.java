package com.project.event_data_transformer.consumer;

import com.project.event_data_transformer.consumer.dto.ConsumerResponse;
import com.project.event_data_transformer.consumer.dto.CreateConsumerRequest;
import com.project.event_data_transformer.consumer.mappers.KafkaConsumerMapper;
import com.project.event_data_transformer.consumer.models.KafkaConsumerEntity;
import com.project.event_data_transformer.consumer.repository.KafkaConsumerConfigRepository;
import com.project.event_data_transformer.eventlog.EventLogService;
import com.project.event_data_transformer.eventlog.models.EventLogModel;
import com.project.event_data_transformer.eventlog.models.EventLogType;
import com.project.event_data_transformer.kafka.DynamicConsumerManager;
import com.project.event_data_transformer.transformer.ProducerService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsumerService {

    private final KafkaConsumerConfigRepository repository;
    private final DynamicConsumerManager consumerManager;
    private final ProducerService producerService;
    private final EventLogService eventLogService;

    public List<ConsumerResponse> getAll() {
        var consumers = repository.findAll();
        return consumers.stream().map(KafkaConsumerMapper::from).toList();
    }

    public ConsumerResponse create(CreateConsumerRequest request) {
        var consumer = KafkaConsumerMapper.to(request);
        repository.save(consumer);
        start(consumer);
        return KafkaConsumerMapper.from(consumer);
    }

    public void start(Long id){
        var config = repository.findById(id).orElseThrow(EntityNotFoundException::new);
        start(config);
    }

    public void stop(Long id) {
        var config = repository.findById(id).orElseThrow(EntityNotFoundException::new);
        consumerManager.stopConsumer(id);
        config.setEnabled(false);
        repository.save(config);
    }

    public void delete(Long id) {
        consumerManager.stopConsumer(id);
        repository.deleteById(id);
    }

    private void start(KafkaConsumerEntity config) {
        consumerManager.startConsumer(
                config.getId(),
                config.getTopic(),
                config.getGroupId(),
                record -> {
                    log.info("Consumer [{}|{}] received from '{}': {}", config.getId(), config.getName(), record.topic(), record.value());
                    var eventLog = new EventLogModel(EventLogType.CONSUMER, record.topic(), null, record.value());
                    eventLogService.log(eventLog);
                    producerService.produce(record.topic(), record.value());
                }
        );
    }
}
