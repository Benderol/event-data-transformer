package com.project.event_data_transformer.transformer;

import com.project.event_data_transformer.transformer.dto.CreateTransformerRequest;
import com.project.event_data_transformer.transformer.dto.TransformerResponse;
import com.project.event_data_transformer.transformer.models.TransformerEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transformers")
@RequiredArgsConstructor
public class DataTransformerController {

    private final DataTransformerService transformerService;

    @GetMapping
    public ResponseEntity<List<TransformerResponse>> getAll() {
        return ResponseEntity.ok(transformerService.getAll());
    }

    @PostMapping
    public ResponseEntity<TransformerResponse> create(@RequestBody CreateTransformerRequest request) {
        return ResponseEntity.ok(transformerService.create(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        transformerService.delete(id);
        return ResponseEntity.ok("Transformer " + id + " deleted");
    }
}
