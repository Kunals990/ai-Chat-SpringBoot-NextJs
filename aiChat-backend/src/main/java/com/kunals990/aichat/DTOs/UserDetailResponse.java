package com.kunals990.aichat.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDetailResponse {
    private String email;
    private String name;
    private String profile_photo;
}
