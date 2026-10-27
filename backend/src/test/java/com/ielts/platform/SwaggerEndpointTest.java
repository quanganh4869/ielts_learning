package com.ielts.platform;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class SwaggerEndpointTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSwaggerEndpoints() throws Exception {
        System.out.println("--- TESTING /v3/api-docs ---");
        mockMvc.perform(get("/v3/api-docs"))
                .andDo(print());

        System.out.println("--- TESTING /swagger-ui/index.html ---");
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andDo(print());

        System.out.println("--- TESTING /swagger-ui.html ---");
        mockMvc.perform(get("/swagger-ui.html"))
                .andDo(print());

        System.out.println("--- TESTING /swagger-ui ---");
        mockMvc.perform(get("/swagger-ui"))
                .andDo(print());
    }
}
