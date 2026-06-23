package com.javiermuredev.investlab.config.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Genera un token JWT firmado con el username como subject.
     */
    public String generateToken(String username) {
        return JWT.create()
                .withSubject(username)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationMs))
                .withIssuer("investlab-api")
                .sign(Algorithm.HMAC256(secret));
    }

    /**
     * Extrae el username (subject) de un token válido.
     */
    public String extractUsername(String token) {
        DecodedJWT jwt = verifyToken(token);
        return jwt.getSubject();
    }

    /**
     * Verifica la firma y expiración del token.
     */
    public DecodedJWT verifyToken(String token) throws JWTVerificationException {
        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secret))
                .withIssuer("investlab-api")
                .build();
        return verifier.verify(token);
    }

    /**
     * Comprueba si un token es válido (firma correcta y no expirado).
     */
    public boolean isTokenValid(String token) {
        try {
            verifyToken(token);
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }
}
