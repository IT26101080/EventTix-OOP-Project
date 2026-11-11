package com.eventtix.service.impl;

import com.eventtix.exception.InvalidLoginException;
import com.eventtix.model.Users.User;
import com.eventtix.repository.custom.UserRepository;
import com.eventtix.service.UserService;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DataSource dataSource;

    public UserServiceImpl(UserRepository userRepository, DataSource dataSource) {
        this.userRepository = userRepository;
        this.dataSource = dataSource;
    }

    @Override
    public User createUser(User user) throws SQLException {
        validateUser(user, true);

        try (
                Connection connection = dataSource.getConnection()
        ) {
            // Do not allow two users with the same username
            if (userRepository.findByUsername(user.getUsername(), connection).isPresent()) {
                throw new IllegalArgumentException("Username is already taken");
            }

            boolean isCreated = userRepository.create(user, connection);
            if (!isCreated) {
                throw new IllegalStateException("User creation failed");
            }

            return hidePassword(user);
        }
    }

    @Override
    public List<User> getAllUsers() throws SQLException {
        try (
                Connection connection = dataSource.getConnection()
        ) {
            List<User> users = userRepository.findAll(connection);

            // Never send passwords to the browser
            for (User user : users) {
                hidePassword(user);
            }
            return users;
        }
    }

    @Override
    public User getUserById(Long userId) throws SQLException {
        validateUserId(userId);

        try (
                Connection connection = dataSource.getConnection()
        ) {
            User user = userRepository.findById(userId, connection).orElseThrow(() ->
                    new NoSuchElementException("User not found with ID: " + userId)
            );
            return hidePassword(user);
        }
    }

    @Override
    public boolean updateUser(Long userId, User user) throws SQLException {
        validateUserId(userId);

        // On edit, the password is optional (blank = keep the old one)
        validateUser(user, false);

        try (
                Connection connection = dataSource.getConnection()
        ) {
            // 1) find the old user
            User oldUser = userRepository.findById(userId, connection).orElse(null);
            if (oldUser == null) {
                return false;
            }

            // 2) if username changed, make sure the new one is not taken by someone else
            User sameName = userRepository.findByUsername(user.getUsername(), connection).orElse(null);
            if (sameName != null && sameName.getUserId() != userId) {
                throw new IllegalArgumentException("Username is already taken");
            }

            // 3) blank password = keep the old password
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(oldUser.getPassword());
            }

            return userRepository.update(userId, user, connection);
        }
    }

    @Override
    public boolean deleteUser(Long userId) throws SQLException {
        validateUserId(userId);

        try (
                Connection connection = dataSource.getConnection()
        ) {
            return userRepository.deleteById(userId, connection);
        }
    }

    @Override
    public User login(String username, String password) throws SQLException {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and password are required");
        }

        try (
                Connection connection = dataSource.getConnection()
        ) {
            User user = userRepository.findByUsername(username.trim(), connection).orElse(null);

            // Same message for "no such user" and "wrong password"
            if (user == null || !user.getPassword().equals(password)) {
                throw new InvalidLoginException("Wrong username or password");
            }

            return hidePassword(user);
        }
    }


    // ---------------------------------------------------------------
    // CREATE ACCOUNT (sign up) page
    // ---------------------------------------------------------------
    @Override
    public User register(User user) throws SQLException {
        if (user == null) {
            throw new IllegalArgumentException("Sign up details cannot be empty");
        }

        // Remove accidental spaces at the start / end (only if the value exists)
        if (user.getFullName() != null) {
            user.setFullName(user.getFullName().trim());
        }
        if (user.getUsername() != null) {
            user.setUsername(user.getUsername().trim());
        }
        if (user.getEmail() != null) {
            user.setEmail(user.getEmail().trim());
        }

        if (user.getEmail() != null && !user.getEmail().isBlank() && !user.getEmail().contains("@")) {
            throw new IllegalArgumentException("Please enter a valid email address");
        }
        if (user.getPassword() != null && !user.getPassword().isBlank() && user.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // The most important line: a new account is always a normal USER
        user.setRole("USER");

        return createUser(user);
    }


    // ---------------------------------------------------------------
    // SETTINGS PAGE: My Profile
    // ---------------------------------------------------------------
    @Override
    public User updateProfile(Long userId, User newDetails) throws SQLException {
        validateUserId(userId);

        if (newDetails == null) {
            throw new IllegalArgumentException("Profile cannot be empty");
        }
        if (newDetails.getFullName() == null || newDetails.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (newDetails.getUsername() == null || newDetails.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (newDetails.getEmail() == null || newDetails.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (!newDetails.getEmail().contains("@")) {
            throw new IllegalArgumentException("Please enter a valid email address");
        }

        try (
                Connection connection = dataSource.getConnection()
        ) {
            // 1) find the person in the database
            User user = userRepository.findById(userId, connection).orElseThrow(() ->
                    new NoSuchElementException("User not found with ID: " + userId)
            );

            // 2) is the new username already used by SOMEONE ELSE?
            User sameName = userRepository.findByUsername(newDetails.getUsername().trim(), connection).orElse(null);
            if (sameName != null && sameName.getUserId() != userId) {
                throw new IllegalArgumentException("Username is already taken");
            }

            // 3) change only the 3 allowed fields (role + password are kept)
            user.setFullName(newDetails.getFullName().trim());
            user.setUsername(newDetails.getUsername().trim());
            user.setEmail(newDetails.getEmail().trim());

            userRepository.update(userId, user, connection);

            return hidePassword(user);
        }
    }

    // ---------------------------------------------------------------
    // SETTINGS PAGE: Change Password
    // ---------------------------------------------------------------
    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) throws SQLException {
        validateUserId(userId);

        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalArgumentException("Current password is required");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        if (newPassword.equals(currentPassword)) {
            throw new IllegalArgumentException("New password must be different from the current one");
        }

        try (
                Connection connection = dataSource.getConnection()
        ) {
            User user = userRepository.findById(userId, connection).orElseThrow(() ->
                    new NoSuchElementException("User not found with ID: " + userId)
            );

            // The old password must match what is in the database
            if (!user.getPassword().equals(currentPassword)) {
                throw new IllegalArgumentException("Current password is incorrect");
            }

            user.setPassword(newPassword);
            userRepository.update(userId, user, connection);
        }
    }


    // ---------- small helper methods ----------

    // Removes the password from the object before we send it out
    private User hidePassword(User user) {
        user.setPassword(null);
        return user;
    }

    private void validateUser(User user, boolean passwordRequired) {

        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        if (user.getFullName() == null || user.getFullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (passwordRequired && (user.getPassword() == null || user.getPassword().isBlank())) {
            throw new IllegalArgumentException("Password is required");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        // Only these 2 roles are allowed
        if (!user.getRole().equals("ADMIN") && !user.getRole().equals("USER")) {
            throw new IllegalArgumentException("Role must be ADMIN or USER");
        }
    }

    private void validateUserId(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
    }
}
