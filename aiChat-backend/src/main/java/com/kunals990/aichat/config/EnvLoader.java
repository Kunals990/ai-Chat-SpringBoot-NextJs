package com.kunals990.aichat.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class EnvLoader {

    @PostConstruct
    public void loadEnv() {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
        System.out.println(">>> OPENAI_API_KEY: " + System.getProperty("OPENAI_API_KEY"));
        System.out.println(">>> TEST_VALUE: " + System.getProperty("TEST_VALUE"));
    }
}
