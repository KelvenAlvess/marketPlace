package com.example.marketPlace;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = MarketPlaceApplication.class)
@ActiveProfiles("test")
class MarketPlaceApplicationTests {

	@Test
	void contextLoads() {
	}
}
