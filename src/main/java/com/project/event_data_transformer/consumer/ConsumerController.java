package com.project.event_data_transformer.consumer;

import com.project.event_data_transformer.consumer.dto.ConsumerResponse;
import com.project.event_data_transformer.consumer.dto.CreateConsumerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consumers")
@RequiredArgsConstructor
public class ConsumerController {

    private final ConsumerService consumerService;

    @GetMapping
    public ResponseEntity<List<ConsumerResponse>> getAll() {
        return ResponseEntity.ok(consumerService.getAll());
    }

    @PostMapping
    public ResponseEntity<ConsumerResponse> create(CreateConsumerRequest request) {
        return ResponseEntity.ok(consumerService.create(request));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<String> start(@PathVariable Long id) {
        consumerService.start(id);
        return ResponseEntity.ok("Consumer " + id + " stopped");
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<String> stop(@PathVariable Long id) {
        consumerService.stop(id);
        return ResponseEntity.ok("Consumer " + id + " stopped");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        consumerService.delete(id);
        return ResponseEntity.ok("Consumer " + id + " deleted");
    }


}
