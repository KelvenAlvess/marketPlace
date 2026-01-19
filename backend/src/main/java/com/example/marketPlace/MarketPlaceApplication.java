package com.example.marketPlace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MarketPlaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MarketPlaceApplication.class, args);
    }
}
