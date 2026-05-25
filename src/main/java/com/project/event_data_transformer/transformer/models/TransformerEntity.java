package com.project.event_data_transformer.transformer.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "transformers")
@Getter
@Setter
@NoArgsConstructor
public class TransformerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String inputTopic;

    @Column(nullable = false)
    private String outputTopic;

    @Column(nullable = false)
    private boolean enabled = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(name = "transformer_rules", joinColumns = @JoinColumn(name = "transformer_id"))
    private List<FieldRuleEntity> rules = new ArrayList<>();
}
