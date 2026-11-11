package com.eventtix.repository.custom;

import com.eventtix.model.Users.User;
import com.eventtix.repository.CrudRepository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;

public interface UserRepository extends CrudRepository<User, Long> {

    // Extra method: find a user by username.
    // We need it for login and for checking duplicate usernames.
    Optional<User> findByUsername(String username, Connection connection) throws SQLException;
}
