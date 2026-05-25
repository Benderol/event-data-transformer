package com.project.event_data_transformer.testsend;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test-send")
@RequiredArgsConstructor
public class TestSendController {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @PostMapping
    public ResponseEntity<String> testSend(@RequestBody TestSendRequest request) {
        kafkaTemplate.send(request.topic(), request.message());
        return ResponseEntity.ok("Sent to '" + request.topic() + "': " + request.message());
    }
}
