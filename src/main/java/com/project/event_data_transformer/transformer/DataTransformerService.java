package com.project.event_data_transformer.transformer;

import com.project.event_data_transformer.transformer.dto.CreateTransformerRequest;
import com.project.event_data_transformer.transformer.dto.TransformerResponse;
import com.project.event_data_transformer.transformer.mappers.TransformerMapper;
import com.project.event_data_transformer.transformer.repository.DataTransformerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DataTransformerService {

    private final DataTransformerRepository transformerRepository;

    public List<TransformerResponse> getAll() {
        var transformers = transformerRepository.findAll();
        return transformers.stream().map(TransformerMapper::from).toList();
    }

    public TransformerResponse create(CreateTransformerRequest request) {
        var transformer = transformerRepository.save(TransformerMapper.to(request));
        return TransformerMapper.from(transformer);
    }

    public void setEnabled(Long id, boolean enabled) {
        var transformer = transformerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transformer not found: " + id));
        transformer.setEnabled(enabled);
        transformerRepository.save(transformer);
    }

    public void delete(Long id) {
        if (!transformerRepository.existsById(id)) {
            throw new EntityNotFoundException("Transformer not found: " + id);
        }
        transformerRepository.deleteById(id);
    }
}
