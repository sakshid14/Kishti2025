package com.kishti.emiwallett.service;

import com.kishti.emiwallett.dto.UserDTO;
import com.kishti.emiwallett.model.User;
import com.kishti.emiwallett.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(UserDTO::new);
    }

    public Optional<UserDTO> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(UserDTO::new);
    }

    public List<UserDTO> getUsersByType(User.UserType userType) {
        return userRepository.findByUserType(userType).stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public List<UserDTO> searchUsersByTypeAndTerm(User.UserType userType, String searchTerm) {
        return userRepository.findByUserTypeAndSearchTerm(userType, searchTerm).stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public UserDTO createUser(UserDTO userDTO, String password) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(userDTO.getEmail());
        user.setFullName(userDTO.getFullName());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setUserType(userDTO.getUserType());
        user.setBusinessName(userDTO.getBusinessName());
        user.setBusinessAddress(userDTO.getBusinessAddress());
        user.setPanNumber(userDTO.getPanNumber());

        User savedUser = userRepository.save(user);
        return new UserDTO(savedUser);
    }

    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check for duplicate username/email (excluding current user)
        if (!user.getUsername().equals(userDTO.getUsername()) && 
            userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (!user.getEmail().equals(userDTO.getEmail()) && 
            userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setFullName(userDTO.getFullName());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setUserType(userDTO.getUserType());
        user.setBusinessName(userDTO.getBusinessName());
        user.setBusinessAddress(userDTO.getBusinessAddress());
        user.setPanNumber(userDTO.getPanNumber());

        User updatedUser = userRepository.save(user);
        return new UserDTO(updatedUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    public boolean validateUser(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.isPresent() && passwordEncoder.matches(password, user.get().getPassword());
    }

    public List<UserDTO> getBorrowers() {
        return getUsersByType(User.UserType.BORROWER);
    }

    public List<UserDTO> getLenders() {
        return getUsersByType(User.UserType.LENDER);
    }
}