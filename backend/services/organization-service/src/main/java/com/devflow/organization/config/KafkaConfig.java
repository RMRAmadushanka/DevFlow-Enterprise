package com.devflow.organization.config;

import com.devflow.common.constant.KafkaTopics;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    NewTopic organizationEventsTopic() {
        return TopicBuilder.name(KafkaTopics.ORGANIZATION_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic teamEventsTopic() {
        return TopicBuilder.name(KafkaTopics.TEAM_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic membershipEventsTopic() {
        return TopicBuilder.name(KafkaTopics.MEMBERSHIP_EVENTS).partitions(3).replicas(1).build();
    }

    @Bean
    NewTopic invitationEventsTopic() {
        return TopicBuilder.name(KafkaTopics.INVITATION_EVENTS).partitions(3).replicas(1).build();
    }
}
