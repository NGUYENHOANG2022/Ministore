package com.team3.ministore.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(Jwts.class);
    private final Long jwtExpiration = 86400000L; // 1 day
    private final String authHeader = "Authorization";
    private final String tokenPrefix = "Bearer";

    // Generate a secure key for HS512
    SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    public String generateJwtToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Date now = new Date();


        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpiration))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public boolean validateJwtToken(String token) {
        try {
            Jwts.parser().setSigningKey(key).parseClaimsJws(token);
            return true;
        } catch (SignatureException e1) {
            logger.error("invalid JWT Signature: {}", e1.getMessage());
        } catch (ExpiredJwtException e2) {
            logger.error("JWT token is expired: {}", e2.getMessage());
        } catch (MalformedJwtException e3) {
            logger.error("invalid JWT token: {}", e3.getMessage());
        } catch (IllegalArgumentException e4) {
            logger.error("JWT claims String is empty: {}", e4.getMessage());
        } catch (UnsupportedJwtException e5) {
            logger.error("JWT Token is not support: {}", e5.getMessage());
        }

        return false;
    }

    public String getJwtTokenFromRequest(HttpServletRequest request) {
        String header = request.getHeader(authHeader);

        if (StringUtils.hasText(header) && header.startsWith(tokenPrefix))
            return header.substring(tokenPrefix.length());

        return null;
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser().setSigningKey(key).parseClaimsJws(token).getBody().getSubject();
    }
}
