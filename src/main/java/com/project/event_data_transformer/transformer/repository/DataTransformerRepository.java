package com.project.event_data_transformer.transformer.repository;

import com.project.event_data_transformer.transformer.models.TransformerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataTransformerRepository extends JpaRepository<TransformerEntity, Long> {

    List<TransformerEntity> findAllByInputTopicAndEnabledTrue(String inputTopic);
}
