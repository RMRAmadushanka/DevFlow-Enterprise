package com.devflow.repository;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RepositoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RepositoryServiceApplication.class, args);
    }
}
