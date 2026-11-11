package com.eventtix.repository.custom;

import com.eventtix.model.Event;
import com.eventtix.repository.CrudRepository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Optional;

public interface EventRepository extends CrudRepository<Event,Long> {

    Optional<Event> findByIdForUpdate(Long id, Connection connection) throws SQLException;
}
