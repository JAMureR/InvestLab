package com.javiermuredev.investlab.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI investLabOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("InvestLab API")
                        .description("API REST del simulador de inversiones InvestLab. " +
                                "Incluye autenticación JWT, gestión de simulaciones, " +
                                "catálogo de fondos indexados y cuentas remuneradas.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Javier Mure")
                                .url("https://javiermuredev.com")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Introduce tu token JWT aquí")));
    }
}
