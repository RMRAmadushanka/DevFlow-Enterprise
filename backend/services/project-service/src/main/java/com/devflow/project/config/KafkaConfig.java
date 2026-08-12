package com.devflow.project.config;

import com.devflow.common.constant.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    NewTopic projectEventsTopic() {
        return TopicBuilder.name(KafkaTopics.PROJECT_EVENTS).partitions(3).replicas(1).build();
    }
}
