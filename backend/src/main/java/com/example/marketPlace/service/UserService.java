package com.example.marketPlace.service;

import com.example.marketPlace.model.User;
import com.example.marketPlace.repository.UserRepository;
import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.dto.UserUpdateDTO; // Importe o DTO
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

        if (userRepository.existsByCpf(dto.cpf())) {
            throw new UserAlreadyExistsException("CPF já cadastrado: " + dto.cpf());
        }

        User user = new User();
        user.setUsername(dto.userName());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setPhoneNumber(dto.phoneNumber());
        user.setAddress(dto.address());
        user.setRoles(dto.roles());
        user.setPassword(bCryptPasswordEncoder.encode(dto.password()));
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Usuário criado com sucesso. ID: {}", savedUser.getUserId());

        return UserResponseDTO.from(savedUser);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        return UserResponseDTO.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado com email: " + email));
        return UserResponseDTO.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDTO::from)
                .collect(Collectors.toList());
    }

    // --- CORREÇÃO: Método aceita UserUpdateDTO ---
    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateDTO dto) {
        log.info("Atualizando usuário. ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (!user.getEmail().equals(dto.email()) && userRepository.existsByEmail(dto.email())) {
            throw new UserAlreadyExistsException("Email já cadastrado: " + dto.email());
        }

        if (!user.getCpf().equals(dto.cpf()) && userRepository.existsByCpf(dto.cpf())) {
            throw new UserAlreadyExistsException("CPF já cadastrado: " + dto.cpf());
        }

        user.setUsername(dto.userName());
        user.setEmail(dto.email());
        user.setCpf(dto.cpf());
        user.setPhoneNumber(dto.phoneNumber());
        user.setAddress(dto.address());
        if (dto.roles() != null) {
            user.setRoles(dto.roles());
        }

        // Lógica de senha: Só atualiza se vier preenchida
        if (dto.password() != null && !dto.password().isEmpty()) {
            user.setPassword(bCryptPasswordEncoder.encode(dto.password()));
        }

        User updatedUser = userRepository.save(user);
        log.info("Usuário atualizado com sucesso. ID: {}, Roles: {}", updatedUser.getUserId(), updatedUser.getRoles());

        return UserResponseDTO.from(updatedUser);
    }
    // ---------------------------------------------

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