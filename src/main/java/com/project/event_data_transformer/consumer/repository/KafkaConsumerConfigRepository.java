package com.project.event_data_transformer.consumer.repository;

import com.project.event_data_transformer.consumer.models.KafkaConsumerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KafkaConsumerConfigRepository extends JpaRepository<KafkaConsumerEntity, Long> {

    List<KafkaConsumerEntity> findAllByEnabledTrue();
}
