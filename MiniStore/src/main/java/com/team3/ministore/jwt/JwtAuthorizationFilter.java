package com.team3.ministore.jwt;

import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthorizationFilter extends OncePerRequestFilter {
	private static final Logger logger = LoggerFactory.getLogger(Jwts.class);
	private final JwtUtils jwtUtils;
	private final UserDetailsService userDetailsService;
	
	public JwtAuthorizationFilter(JwtUtils utils, UserDetailsService service) {
		jwtUtils = utils;
		userDetailsService = service;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		// authorize the request before 
		try {
			String token = jwtUtils.getJwtTokenFromRequest(request);
			
			if(token != null && jwtUtils.validateJwtToken(token)) {
				String username = jwtUtils.getUsernameFromToken(token);
				
				// authorized
				
				UserDetails userDetails = userDetailsService.loadUserByUsername(username);
				Authentication auth = new UsernamePasswordAuthenticationToken(username, null, userDetails.getAuthorities());
				
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		} catch (Exception e) {
			logger.debug("An unauthorized request has been sent from {}.", request.getRemoteAddr());
		}
		
		filterChain.doFilter(request, response);
	}

}
