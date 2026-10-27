package com.ielts.platform.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Convenient redirects for Swagger UI and API Documentation.
 * Ensures accessing /swagger-ui, /swagger-ui/, /swagger, or /docs
 * smoothly redirects to the canonical /swagger-ui/index.html page without 404 or 500 errors.
 */
@Controller
public class SwaggerRedirectController {

    @GetMapping({"/swagger-ui", "/swagger-ui/", "/swagger", "/docs"})
    public String redirectToSwaggerUi() {
        return "redirect:/swagger-ui/index.html";
    }
}
