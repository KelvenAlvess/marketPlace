package com.example.marketPlace.service;

import com.example.marketPlace.configurations.JwtTokenUtil;
import com.example.marketPlace.dto.LoginRequestDTO;
import com.example.marketPlace.dto.LoginResponseDTO;
import com.example.marketPlace.exception.InvalidCredentialsException;
import com.example.marketPlace.model.User;
import com.example.marketPlace.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO dto) {
        log.info("Login request received");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email(), dto.password())
            );

            User user = userRepository.findByEmail(dto.email())
                    .orElseThrow(() -> new InvalidCredentialsException("Credenciais inválidas"));

            String token = jwtTokenUtil.generateToken(
                    user.getEmail(),
                    user.getUserId(),
                    user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
            );

            log.info("Login realizado com sucesso para o usuário: {}", user.getEmail());

            return new LoginResponseDTO(
                    user.getUserId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRoles(),
                    token
            );
        } catch (BadCredentialsException e) {
            log.warn("Credenciais inválidas para o email: {}", dto.email());
            throw new InvalidCredentialsException("Credenciais inválidas");
        }
    }
}
