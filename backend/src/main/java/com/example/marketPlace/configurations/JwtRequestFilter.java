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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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

        // Ignorar rotas públicas que não precisam de token para evitar processamento desnecessário
        String path = request.getRequestURI();

        // Swagger e documentação
        if (path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/api/auth") ||
                path.startsWith("/h2-console")) {
            chain.doFilter(request, response);
            return;
        }

        // Webhook do Mercado Pago (Público)
        if (path.equals("/api/payments/webhook")) {
            chain.doFilter(request, response);
            return;
        }

        // Permite GET em produtos e categorias sem token
        if (request.getMethod().equals("GET") && (
                path.startsWith("/api/products") ||
                        path.startsWith("/api/categories") ||
                        path.startsWith("/api/users/exists/"))) {
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
                log.warn("Token JWT expirado");
            } catch (Exception e) {
                log.error("Erro ao processar token JWT", e);
            }
        } else {
            log.warn("⚠️ Nenhum token Bearer encontrado no header Authorization");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // CORREÇÃO: Envolvemos a busca do usuário em um try-catch.
                // Se o banco foi resetado e o token é antigo, o loadUserByUsername lança exceção.
                // Antes, isso causava erro 500. Agora, tratamos graciosamente.
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtTokenUtil.validateToken(jwtToken, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (UsernameNotFoundException e) {
                log.warn("Usuário do token não encontrado no banco de dados (Token órfão): {}", username);
                // Não fazemos nada: o SecurityContext continua null,
                // e o Spring Security retornará 401 ou 403 dependendo da rota.
            }
        }
        chain.doFilter(request, response);
    }
}