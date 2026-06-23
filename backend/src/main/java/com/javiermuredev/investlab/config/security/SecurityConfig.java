package com.javiermuredev.investlab.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuración centralizada de Spring Security para la API REST.
 * Usa JWT stateless (sin sesiones), BCrypt para contraseñas,
 * y define las rutas públicas vs protegidas.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desactivar CSRF para API REST stateless
            .csrf(csrf -> csrf.disable())

            // Permitir frames para la consola H2
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))

            // Política de sesiones: STATELESS (todo vía JWT)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Reglas de autorización
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/funds/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/accounts/**").permitAll()

                // Swagger / OpenAPI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()

                // Actuator
                .requestMatchers("/actuator/**").permitAll()

                // H2 Console (solo desarrollo)
                .requestMatchers("/h2-console/**").permitAll()

                // Todo lo demás requiere autenticación
                .anyRequest().authenticated()
            )

            // Insertar el filtro JWT antes del filtro de autenticación por defecto
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
