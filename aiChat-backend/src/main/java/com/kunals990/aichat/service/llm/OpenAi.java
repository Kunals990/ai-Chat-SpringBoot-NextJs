package com.kunals990.aichat.service.llm;


import com.google.genai.Client;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class OpenAi implements LLM{
    public final String apiKey;
    private final OpenAIClient openAIClient;
    @Autowired
    private RestTemplate restTemplate;

    public OpenAi(@Value("${openai.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.openAIClient = OpenAIOkHttpClient.builder()
                            .apiKey(apiKey)
                            .build();
    }

    @Override
    public String getResponse(String message) {
        if(message==null || message.trim().isEmpty()){
            throw new IllegalArgumentException("Message cannot be null or empty");
        }
        // Build request params
        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .addUserMessage(message)
                .model(ChatModel.GPT_4O_MINI)
                .build();

        ChatCompletion result = openAIClient.chat().completions().create(params);

        // Extract the AI's reply
        System.out.println("This is openai");
        return result.choices().get(0).message().content().orElse("");
    }

}
