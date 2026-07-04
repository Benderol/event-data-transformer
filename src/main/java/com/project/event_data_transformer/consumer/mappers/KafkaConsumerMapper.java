package com.project.event_data_transformer.consumer.mappers;

import com.project.event_data_transformer.consumer.dto.ConsumerResponse;
import com.project.event_data_transformer.consumer.dto.CreateConsumerRequest;
import com.project.event_data_transformer.consumer.models.KafkaConsumerEntity;

public class KafkaConsumerMapper {

    public static KafkaConsumerEntity to(CreateConsumerRequest request) {
        var entity = new KafkaConsumerEntity();
        entity.setName(request.name());
        entity.setTopic(request.topic());
        entity.setGroupId(request.groupId());
        entity.setEnabled(request.enabled());
        return entity;
    }

    public static ConsumerResponse from(KafkaConsumerEntity entity) {
        return new ConsumerResponse(entity.getId(), entity.getName(), entity.getTopic(), entity.getGroupId(), entity.getCreatedAt(), entity.isEnabled());
    }

}
