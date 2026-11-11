package com.eventtix.service;

import com.eventtix.model.Users.User;

import java.sql.SQLException;
import java.util.List;

public interface UserService {
    User createUser(User user) throws SQLException;
    List<User> getAllUsers() throws SQLException;
    User getUserById(Long userId) throws SQLException;
    boolean updateUser(Long userId, User user) throws SQLException;
    boolean deleteUser(Long userId) throws SQLException;
    User login(String username, String password) throws SQLException;

    // Used by the "Create account" page. The new user is ALWAYS a normal USER.
    User register(User user) throws SQLException;

    // ----- used by the Settings page -----
    // Change only name / username / email of ONE user. Returns the updated user.
    User updateProfile(Long userId, User newDetails) throws SQLException;

    // Change the password. The old password must be correct.
    void changePassword(Long userId, String currentPassword, String newPassword) throws SQLException;
}
