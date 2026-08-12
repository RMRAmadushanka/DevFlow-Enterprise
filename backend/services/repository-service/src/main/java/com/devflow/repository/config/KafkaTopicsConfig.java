package com.devflow.repository.config;

import com.devflow.common.constant.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Ensures foundation topics exist when the service starts (idempotent).
 */
@Configuration
public class KafkaTopicsConfig {

    @Bean
    NewTopic userEventsTopic() {
        return TopicBuilder.name(KafkaTopics.USER_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic projectEventsTopic() {
        return TopicBuilder.name(KafkaTopics.PROJECT_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic taskEventsTopic() {
        return TopicBuilder.name(KafkaTopics.TASK_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic notificationEventsTopic() {
        return TopicBuilder.name(KafkaTopics.NOTIFICATION_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic auditEventsTopic() {
        return TopicBuilder.name(KafkaTopics.AUDIT_EVENTS).partitions(3).replicas(1).build();
    }
}
