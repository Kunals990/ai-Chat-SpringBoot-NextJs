package com.kunals990.aichat.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ChatRequest {
    private List<MessageDTO> messages;

    @JsonProperty("LLM")
    private String LLM;

    private SessionRef session;

    @Data
    public static class MessageDTO {
        private String role;
        private List<PartDTO> parts;
    }

    @Data
    public static class PartDTO {
        private String text;
    }

    @Data
    public static class SessionRef {
        private UUID id;
    }
}