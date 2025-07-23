package com.kishti.emiwallett.controller;

import com.kishti.emiwallett.dto.UserDTO;
import com.kishti.emiwallett.model.User;
import com.kishti.emiwallett.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{userType}")
    public ResponseEntity<List<UserDTO>> getUsersByType(@PathVariable User.UserType userType) {
        return ResponseEntity.ok(userService.getUsersByType(userType));
    }

    @GetMapping("/borrowers")
    public ResponseEntity<List<UserDTO>> getBorrowers() {
        return ResponseEntity.ok(userService.getBorrowers());
    }

    @GetMapping("/lenders")
    public ResponseEntity<List<UserDTO>> getLenders() {
        return ResponseEntity.ok(userService.getLenders());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(
            @RequestParam User.UserType userType,
            @RequestParam String searchTerm) {
        return ResponseEntity.ok(userService.searchUsersByTypeAndTerm(userType, searchTerm));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody Map<String, Object> request) {
        try {
            UserDTO userDTO = new UserDTO();
            userDTO.setUsername((String) request.get("username"));
            userDTO.setEmail((String) request.get("email"));
            userDTO.setFullName((String) request.get("fullName"));
            userDTO.setPhoneNumber((String) request.get("phoneNumber"));
            userDTO.setUserType(User.UserType.valueOf((String) request.get("userType")));
            userDTO.setBusinessName((String) request.get("businessName"));
            userDTO.setBusinessAddress((String) request.get("businessAddress"));
            userDTO.setPanNumber((String) request.get("panNumber"));

            String password = (String) request.get("password");
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            UserDTO createdUser = userService.createUser(userDTO, password);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateUser(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (userService.validateUser(username, password)) {
            UserDTO user = userService.getUserByUsername(username).orElse(null);
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "user", user
            ));
        } else {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }
}