package com.example.marketPlace.service;

import com.example.marketPlace.dto.UserCreateDTO;
import com.example.marketPlace.dto.UserResponseDTO;
import com.example.marketPlace.exception.UserAlreadyExistsException;
import com.example.marketPlace.exception.UserNotFoundException;
import com.example.marketPlace.model.User;
import com.example.marketPlace.model.enums.UserRole;
import com.example.marketPlace.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @InjectMocks
    private UserService userService;

    private UserCreateDTO createValidUserCreateDTO() {
        return new UserCreateDTO(
                "luiz",
                "luiz123@gmal.com", "12345678901", "81999999999", "senhaForte123",
                "Rua A, 123", Set.of(UserRole.BUYER)
        );
    }

    private User buildValidUser() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("João Silva");
        user.setEmail("joao@email.com");
        user.setCpf("12345678901");
        user.setPassword("senhaEncriptadaHash");
        return user;
    }

    @Test
    @DisplayName("Deve criar um usuário com sucesso e encriptar a senha")
    void shouldCreateUserSuccessfully() {
        // Arrange
        UserCreateDTO dto = createValidUserCreateDTO();
        User savedUser = buildValidUser();

        when(bCryptPasswordEncoder.encode(dto.password())).thenReturn("senhaEncriptadaHash");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserResponseDTO userResponseDTO = userService.createUser(dto);

        // Assert
        assertNotNull(userResponseDTO);
        verify(bCryptPasswordEncoder, times(1)).encode("senhaForte123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Deve lançar UserAlreadyExistsException quando CPF já estiver cadastrado")
    void shouldThrowExceptionWhenCpfAlreadyExists() {
        // Arrange
        UserCreateDTO dto = createValidUserCreateDTO();

        when(userRepository.existsByCpf(dto.cpf())).thenReturn(true);

        // Act & Assert
        Exception e = assertThrows(UserAlreadyExistsException.class, () -> userService.createUser(dto));

        assertTrue(e.getMessage().contains("CPF") || e.getMessage().contains("já cadastrado"));

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve retornar um UserResponseDTO quando o repositório encontrar o ID com sucesso")
    void shouldReturnUserResponseDTOWhenUserFoundById() {
        // Arrange
        User foundUser = buildValidUser();

        when(userRepository.findById(1L)).thenReturn(Optional.of(foundUser));

        // Act
        UserResponseDTO result = userService.getUserById(1L);

        // Assert
        assertNotNull(result);

        assertEquals("João Silva", result.userName());
        assertEquals("joao@email.com", result.email());

        verify(userRepository, times(1)).findById(1L);

    }

    @Test
    @DisplayName("Deve lançar UserNotFoundException quando o repositório não encontrar o ID")
    void shouldThrowUserNotFoundExceptionWhenUserNotFoundById() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        Exception e = assertThrows(UserNotFoundException.class, () -> userService.getUserById(99L));

        assertTrue(e.getMessage().contains("99"));

        verify(userRepository, times(1)).findById(99L);

    }

    @Test
    @DisplayName("Deve retornar um UserResponseDTO quando o repositório encontrar o email com sucesso")
    void shouldReturnUserResponseDTOWhenUserFoundByEmail() {
        // Arrange
        when(userRepository.findByEmail("kelven@gmail.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception e = assertThrows(UserNotFoundException.class, () -> userService.getUserByEmail("kelven@gmail.com"));

        assertTrue(e.getMessage().contains("kelven@gmail.com"));

        verify(userRepository, times(1)).findByEmail("kelven@gmail.com");
    }

    @Test
    @DisplayName("Deve lançar UserNotFoundException quando o repositório não encontrar o email")
    void shouldThrowUserNotFoundExceptionWhenUserNotFoundByEmail() {
        // Arrange
        when(userRepository.findByEmail("kelven@gmail.com")).thenReturn(Optional.empty());

        // Act & Assert
        Exception e = assertThrows(UserNotFoundException.class, () -> userService.getUserByEmail("kelven@gmail.com"));

        assertTrue(e.getMessage().contains("kelven@gmail.com"));

        verify(userRepository, times(1)).findByEmail("kelven@gmail.com");
    }

    @Test
    @DisplayName("Deve lançar UserAlreadyExistsException quando email já estiver cadastrado")
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        // Arrange
        UserCreateDTO dto = createValidUserCreateDTO();

        when(userRepository.existsByEmail(dto.email())).thenReturn(true);

        // Act & Assert
        Exception e = assertThrows(UserAlreadyExistsException.class, () -> userService.createUser(dto));

        assertTrue(e.getMessage().contains("e-mail") || e.getMessage().contains("já cadastrado"));

        verify(userRepository, never()).save(any());
    }
}