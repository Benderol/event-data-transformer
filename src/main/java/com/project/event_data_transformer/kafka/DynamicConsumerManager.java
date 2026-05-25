package com.project.event_data_transformer.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class DynamicConsumerManager {

    private final ConsumerFactory<String, String> consumerFactory;

    private final Map<Long, ConcurrentMessageListenerContainer<String, String>> containers = new ConcurrentHashMap<>();

    public void startConsumer(Long consumerId, String topic, String groupId, MessageListener<String, String> listener) {
        if (containers.containsKey(consumerId)) {
            log.warn("Consumer {} is already running on topic '{}', stop it first", consumerId, topic);
            return;
        }

        var props = new ContainerProperties(topic);
        props.setGroupId(groupId);
        props.setMessageListener(listener);

        var container = new ConcurrentMessageListenerContainer<>(consumerFactory, props);

        container.start();
        containers.put(consumerId, container);
        log.info("Started consumer {} on topic '{}' with group '{}'", consumerId, topic, groupId);
    }

    public void stopConsumer(Long consumerId) {
        var container = containers.remove(consumerId);
        if (container == null) {
            log.warn("No running consumer found for id {}", consumerId);
            return;
        }
        container.stop();
        log.info("Stopped consumer {}", consumerId);
    }

    public void restartConsumer(Long consumerId, String topic, String groupId, MessageListener<String, String> listener) {
        stopConsumer(consumerId);
        startConsumer(consumerId, topic, groupId, listener);
    }

    public boolean isRunning(Long consumerId) {
        ConcurrentMessageListenerContainer<String, String> container = containers.get(consumerId);
        return container != null && container.isRunning();
    }
}
