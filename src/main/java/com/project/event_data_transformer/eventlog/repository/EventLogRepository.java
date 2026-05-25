package com.project.event_data_transformer.eventlog.repository;

import com.project.event_data_transformer.eventlog.models.EventLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface EventLogRepository extends JpaRepository<EventLogEntity, Long> {

    @Modifying
    @Query("DELETE FROM EventLogEntity e WHERE e.createdAt < :cutoff")
    int deleteOlderThan(LocalDateTime cutoff);
}
