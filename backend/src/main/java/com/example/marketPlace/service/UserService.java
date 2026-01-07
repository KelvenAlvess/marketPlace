package com.example.marketPlace.service;

import com.example.marketPlace.model.User;
import com.example.marketPlace.repository.UserRepository;
import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.exception.UserAlreadyExistsException;
import com.example.marketPlace.exception.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Transactional
    public UserResponseDTO createUser(UserCreateDTO dto) {

        if (userRepository.existsByEmail(dto.email())) {
            throw new UserAlreadyExistsException("Email já cadastrado: " + dto.email());
        }

        User user = new User();
        user.setUserName(dto.userName());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setPhoneNumber(dto.phoneNumber());
        user.setPassword(bCryptPasswordEncoder.encode(dto.password()));
        user.setAddress(dto.address());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Usuário criado com sucesso. ID: {}", savedUser.getUser_ID());

        return UserResponseDTO.from(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        log.info("Buscando usuário por ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Usuário não encontrado. ID: {}", id);
                    return new UserNotFoundException("Usuário não encontrado com ID: " + id);
                });

        return UserResponseDTO.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        log.info("Buscando usuário por email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Usuário não encontrado. Email: {}", email);
                    return new UserNotFoundException("Usuário não encontrado com email: " + email);
                });

        return UserResponseDTO.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        log.info("Listando todos os usuários");

        return userRepository.findAll().stream()
                .map(UserResponseDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UserCreateDTO dto) {
        log.info("Atualizando usuário. ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com ID: " + id));

        if (!user.getEmail().equals(dto.email()) && userRepository.existsByEmail(dto.email())) {
            throw new UserAlreadyExistsException("Email já cadastrado: " + dto.email());
        }

        user.setUserName(dto.userName());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setPhoneNumber(dto.phoneNumber());
        user.setAddress(dto.address());

        if (dto.password() != null && !dto.password().isEmpty()) {
            user.setPassword(bCryptPasswordEncoder.encode(dto.password()));
        }

        User updatedUser = userRepository.save(user);
        log.info("Usuário atualizado com sucesso. ID: {}", updatedUser.getUser_ID());

        return UserResponseDTO.from(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        log.info("Deletando usuário. ID: {}", id);

        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("Usuário não encontrado com ID: " + id);
        }

        userRepository.deleteById(id);
        log.info("Usuário deletado com sucesso. ID: {}", id);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
