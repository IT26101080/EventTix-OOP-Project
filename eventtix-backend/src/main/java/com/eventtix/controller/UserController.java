package com.eventtix.controller;

import com.eventtix.dto.request.ChangePasswordRequest;
import com.eventtix.dto.request.CreateUserRequest;
import com.eventtix.dto.request.UpdateProfileRequest;
import com.eventtix.model.Users.User;
import com.eventtix.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest request) throws SQLException {

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        User createdUser = userService.createUser(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() throws SQLException {

        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable Long userId) throws SQLException {

        User user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateUser(@PathVariable Long userId, @RequestBody CreateUserRequest request) throws SQLException {

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());

        boolean isUpdated = userService.updateUser(userId, user);

        if (!isUpdated) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) throws SQLException {

        boolean isDeleted = userService.deleteUser(userId);

        if (!isDeleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // ---------- SETTINGS PAGE endpoints ----------

    // PUT /api/users/{userId}/profile
    // Saves the "My Profile" form. Returns the updated user.
    @PutMapping("/{userId}/profile")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody UpdateProfileRequest request) throws SQLException {

        User details = new User();
        details.setFullName(request.getFullName());
        details.setUsername(request.getUsername());
        details.setEmail(request.getEmail());

        User updatedUser = userService.updateProfile(userId, details);
        return ResponseEntity.ok(updatedUser);
    }

    // PUT /api/users/{userId}/password
    // Saves the "Change Password" form.
    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable Long userId, @RequestBody ChangePasswordRequest request) throws SQLException {

        userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed"));
    }
}
