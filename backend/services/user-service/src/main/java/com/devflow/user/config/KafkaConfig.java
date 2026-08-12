package com.devflow.user.config;

import com.devflow.common.constant.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    NewTopic userEventsTopic() {
        return TopicBuilder.name(KafkaTopics.USER_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    NewTopic userAuthenticationEventsTopic() {
        return TopicBuilder.name(KafkaTopics.USER_AUTHENTICATION_EVENTS)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
