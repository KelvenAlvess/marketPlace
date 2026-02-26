package com.example.marketPlace.service;



import io.github.bucket4j.Bandwidth;

import io.github.bucket4j.Bucket;

import io.github.bucket4j.Refill;

import org.springframework.stereotype.Service;



import java.time.Duration;

import java.util.Map;

import java.util.concurrent.ConcurrentHashMap;



@Service

public class RateLimitingService {



    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();



    public Bucket resolveBucket(String key) {

        return cache.computeIfAbsent(key, this::newBucket);

    }



    private Bucket newBucket(String key) {



        Bandwidth limitGeneral = Bandwidth.classic(50, Refill.intervally(50, Duration.ofMinutes(1)));



        Bandwidth limitBurst = Bandwidth.classic(10, Refill.intervally(10, Duration.ofSeconds(1)));



        return Bucket.builder()

                .addLimit(limitGeneral)

                .addLimit(limitBurst)

                .build();

    }



    public Bucket resolveStrictBucket(String key) {

        return cache.computeIfAbsent("strict-" + key, k -> {



            Bandwidth strictLimit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));

            return Bucket.builder().addLimit(strictLimit).build();

        });

    }

}