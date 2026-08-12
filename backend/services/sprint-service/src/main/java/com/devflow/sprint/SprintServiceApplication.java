package com.devflow.sprint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SprintServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SprintServiceApplication.class, args);
    }
}
