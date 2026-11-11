package com.eventtix.controller;

import com.eventtix.dto.request.LoginRequest;
import com.eventtix.dto.request.RegisterRequest;
import com.eventtix.model.Users.User;
import com.eventtix.service.UserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest request) throws SQLException {

        User user = userService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(user);
    }

    // POST /api/auth/register
    // Used by the "Create account" page.
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) throws SQLException {

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        User createdUser = userService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
}
