package com.example.marketPlace.configurations;

import com.example.marketPlace.service.CustomUserDetailsService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtRequestFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Ignorar rotas públicas
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Swagger e documentação
        if (path.startsWith("/swagger-ui") ||
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/swagger-resources") ||
            path.startsWith("/webjars") ||
            path.equals("/swagger-ui.html") ||
            path.equals("/")) {
            chain.doFilter(request, response);
            return;
        }

        // Autenticação e registro
        if (path.startsWith("/api/auth/") ||
            (path.equals("/api/users") && method.equals("POST")) ||
            path.startsWith("/api/users/exists/")) {
            chain.doFilter(request, response);
            return;
        }

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        log.info("🔍 Requisição: {} {} - Auth Header: {}", method, path, requestTokenHeader != null ? "Presente" : "Ausente");

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.extractUsername(jwtToken);
                log.info("✅ Token JWT válido - Usuário: {}", username);
            } catch (IllegalArgumentException e) {
                log.error("❌ Não foi possível obter o token JWT");
            } catch (ExpiredJwtException e) {
                log.error("❌ Token JWT expirado");
            }
        } else {
            log.warn("⚠️ Nenhum token Bearer encontrado no header Authorization");
        }

        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(jwtToken,userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("🔐 Autenticação definida para usuário: {} com roles: {}", username, userDetails.getAuthorities());
            } else {
                log.error("❌ Token inválido para usuário: {}", username);
            }
        }
        chain.doFilter(request, response);
    }
}
