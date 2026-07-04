package com.project.event_data_transformer.transformer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.event_data_transformer.transformer.dto.CreateTransformerRequest;
import com.project.event_data_transformer.transformer.dto.FieldRuleDto;
import com.project.event_data_transformer.transformer.dto.TransformerResponse;
import com.project.event_data_transformer.transformer.models.TransformationType;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DataTransformerController.class)
class DataTransformerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private DataTransformerService transformerService;

    private static final FieldRuleDto INCLUDE_RULE =
            new FieldRuleDto("name", TransformationType.INCLUDE, null, null, null);

    @Test
    void testValid() throws Exception {
        var request = new CreateTransformerRequest("input-topic", "my-transformer", "output-topic", List.of(INCLUDE_RULE));
        var response = new TransformerResponse(1L, "my-transformer", "input-topic", "output-topic", true, LocalDateTime.now(), List.of(INCLUDE_RULE));

        when(transformerService.create(any())).thenReturn(response);

        mockMvc.perform(post("/transformers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("my-transformer"))
                .andExpect(jsonPath("$.inputTopic").value("input-topic"))
                .andExpect(jsonPath("$.outputTopic").value("output-topic"));
    }

    @Test
    void testSameInputAndOutputTopic() throws Exception {
        var request = new CreateTransformerRequest("same-topic", "my-transformer", "same-topic", List.of(INCLUDE_RULE));

        mockMvc.perform(post("/transformers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testBlankNameTransformer() throws Exception {
        var request = new CreateTransformerRequest("input-topic", "", "output-topic", List.of(INCLUDE_RULE));

        mockMvc.perform(post("/transformers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testTransformerWithoutRules() throws Exception {
        var request = new CreateTransformerRequest("input-topic", "my-transformer", "output-topic", List.of());

        mockMvc.perform(post("/transformers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAll() throws Exception {
        var response = new TransformerResponse(1L, "my-transformer", "input-topic", "output-topic", true, LocalDateTime.now(), List.of(INCLUDE_RULE));
        when(transformerService.getAll()).thenReturn(List.of(response));

        mockMvc.perform(get("/transformers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("my-transformer"))
                .andExpect(jsonPath("$[0].rules[0].fieldName").value("name"));
    }

    @Test
    void testDeletionOfTransformer() throws Exception {
        doNothing().when(transformerService).delete(1L);

        mockMvc.perform(delete("/transformers/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Transformer 1 deleted"));
    }

    @Test
    void testDeletionOfNotExistingTransformer() throws Exception {
        doThrow(new EntityNotFoundException("Transformer not found: 99"))
                .when(transformerService).delete(99L);

        mockMvc.perform(delete("/transformers/99"))
                .andExpect(status().isNotFound());
    }
}
