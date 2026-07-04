package com.project.event_data_transformer.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.event_data_transformer.consumer.dto.ConsumerResponse;
import com.project.event_data_transformer.consumer.dto.CreateConsumerRequest;
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

@WebMvcTest(ConsumerController.class)
class ConsumerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ConsumerService consumerService;

    private static final ConsumerResponse CONSUMER_RESPONSE =
            new ConsumerResponse(1L, "my-consumer", "my-topic", "my-group", LocalDateTime.now(), true);

    @Test
    void testValid() throws Exception {
        var request = new CreateConsumerRequest("my-consumer", "my-topic", "my-group", true);
        when(consumerService.create(any())).thenReturn(CONSUMER_RESPONSE);

        mockMvc.perform(post("/consumers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("my-consumer"))
                .andExpect(jsonPath("$.topic").value("my-topic"))
                .andExpect(jsonPath("$.groupId").value("my-group"));
    }

    @Test
    void testBlankName() throws Exception {
        var request = new CreateConsumerRequest("", "my-topic", "my-group", true);

        mockMvc.perform(post("/consumers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testBlankTopic() throws Exception {
        var request = new CreateConsumerRequest("my-consumer", "", "my-group", true);

        mockMvc.perform(post("/consumers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testBlankGroupId() throws Exception {
        var request = new CreateConsumerRequest("my-consumer", "my-topic", "", true);

        mockMvc.perform(post("/consumers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetAll() throws Exception {
        when(consumerService.getAll()).thenReturn(List.of(CONSUMER_RESPONSE));

        mockMvc.perform(get("/consumers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("my-consumer"))
                .andExpect(jsonPath("$[0].topic").value("my-topic"));
    }

    @Test
    void testStart() throws Exception {
        doNothing().when(consumerService).start(1L);

        mockMvc.perform(post("/consumers/1/start"))
                .andExpect(status().isOk())
                .andExpect(content().string("Consumer 1 started"));
    }

    @Test
    void testStartNotExisting() throws Exception {
        doThrow(new EntityNotFoundException("Consumer not found: 99"))
                .when(consumerService).start(99L);

        mockMvc.perform(post("/consumers/99/start"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testStop() throws Exception {
        doNothing().when(consumerService).stop(1L);

        mockMvc.perform(post("/consumers/1/stop"))
                .andExpect(status().isOk())
                .andExpect(content().string("Consumer 1 stopped"));
    }

    @Test
    void testStopNotExisting() throws Exception {
        doThrow(new EntityNotFoundException("Consumer not found: 99"))
                .when(consumerService).stop(99L);

        mockMvc.perform(post("/consumers/99/stop"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDelete() throws Exception {
        doNothing().when(consumerService).delete(1L);

        mockMvc.perform(delete("/consumers/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Consumer 1 deleted"));
    }
}
