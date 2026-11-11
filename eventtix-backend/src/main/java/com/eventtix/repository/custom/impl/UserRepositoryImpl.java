package com.eventtix.repository.custom.impl;

import com.eventtix.model.Users.User;
import com.eventtix.repository.custom.UserRepository;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepositoryImpl implements UserRepository {

    @Override
    public boolean create(User user, Connection connection) throws SQLException {
        String sql = "INSERT INTO users(full_name, username, email, password, role) VALUES (?, ?, ?, ?, ?)";

        try (
                PreparedStatement pstm = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
        ) {
            pstm.setString(1, user.getFullName());
            pstm.setString(2, user.getUsername());
            pstm.setString(3, user.getEmail());
            pstm.setString(4, user.getPassword());
            pstm.setString(5, user.getRole());

            int affectedRows = pstm.executeUpdate();

            if (affectedRows == 0) {
                return false;
            }

            // Get the new id that MySQL made for this user
            try (ResultSet keys = pstm.getGeneratedKeys()) {
                if (keys.next()) {
                    user.setUserId(keys.getLong(1));
                    return true;
                }

                throw new SQLException("Failed to retrieve generated user ID");
            }
        }
    }

    @Override
    public List<User> findAll(Connection connection) throws SQLException {
        String sql = "SELECT * FROM users";

        ArrayList<User> userList = new ArrayList<>();
        try (
                PreparedStatement pstm = connection.prepareStatement(sql);
                ResultSet rs = pstm.executeQuery()
        ) {
            while (rs.next()) {
                User user = mapUser(rs);
                userList.add(user);
            }
        }

        return userList;
    }

    @Override
    public Optional<User> findById(Long id, Connection connection) throws SQLException {
        try (
                PreparedStatement ps = connection.prepareStatement("SELECT * FROM users WHERE id = ?")
        ) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapUser(rs));
                }
                return Optional.empty();
            }
        }
    }

    @Override
    public Optional<User> findByUsername(String username, Connection connection) throws SQLException {
        try (
                PreparedStatement ps = connection.prepareStatement("SELECT * FROM users WHERE username = ?")
        ) {
            ps.setString(1, username);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapUser(rs));
                }
                return Optional.empty();
            }
        }
    }

    @Override
    public boolean update(Long id, User user, Connection connection) throws SQLException {
        String sql = "UPDATE users SET full_name = ?, username = ?, email = ?, password = ?, role = ? WHERE id = ?";

        try (
                PreparedStatement pstm = connection.prepareStatement(sql)
        ) {
            pstm.setString(1, user.getFullName());
            pstm.setString(2, user.getUsername());
            pstm.setString(3, user.getEmail());
            pstm.setString(4, user.getPassword());
            pstm.setString(5, user.getRole());
            pstm.setLong(6, id);

            return pstm.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteById(Long id, Connection connection) throws SQLException {
        String sql = "DELETE FROM users WHERE id = ?";
        try (
                PreparedStatement pstm = connection.prepareStatement(sql)
        ) {
            pstm.setLong(1, id);
            return pstm.executeUpdate() > 0;
        }
    }

    // Turns one database row into one User object
    private User mapUser(ResultSet rs) throws SQLException {
        User user = new User();

        user.setUserId(rs.getLong("id"));
        user.setFullName(rs.getString("full_name"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPassword(rs.getString("password"));
        user.setRole(rs.getString("role"));

        return user;
    }
}
