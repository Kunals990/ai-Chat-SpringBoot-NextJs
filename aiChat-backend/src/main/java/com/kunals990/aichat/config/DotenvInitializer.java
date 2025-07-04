package com.kunals990.aichat.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

public class DotenvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
        System.out.println(">>> DotenvInitializer loaded ✅");
        System.out.println(">>> OPENAI_API_KEY = " + System.getProperty("OPENAI_API_KEY"));
        System.out.println(">>> JWT_SECRET from DotenvInitializer: " + System.getProperty("JWT_SECRET"));

    }
}
