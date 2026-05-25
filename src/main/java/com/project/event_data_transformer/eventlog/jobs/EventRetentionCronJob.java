package com.project.event_data_transformer.eventlog.jobs;

import com.project.event_data_transformer.eventlog.repository.EventLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventRetentionCronJob {

    private static final int RETENTION_DAYS = 7;

    private final EventLogRepository repository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void deleteOldLogs() {
        var cutoff = LocalDateTime.now().minusDays(RETENTION_DAYS);
        int deleted = repository.deleteOlderThan(cutoff);
        log.info("EventRetentionCronJob: deleted {} log(s) older than {} days", deleted, RETENTION_DAYS);
    }
}
