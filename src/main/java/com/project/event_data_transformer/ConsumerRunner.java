package com.project.event_data_transformer;

import com.project.event_data_transformer.consumer.ConsumerService;
import com.project.event_data_transformer.consumer.repository.KafkaConsumerConfigRepository;
import com.project.event_data_transformer.consumer.models.KafkaConsumerEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConsumerRunner implements ApplicationRunner {

    private final KafkaConsumerConfigRepository repository;
    private final ConsumerService consumerService;

    @Override
    public void run(ApplicationArguments args) {
        List<KafkaConsumerEntity> configs = repository.findAllByEnabledTrue();
        log.info("Bootstrapping {} consumer(s) from database", configs.size());
        configs.stream().map(KafkaConsumerEntity::getId).forEach(consumerService::start);
    }
}
