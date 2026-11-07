package com.eventtix.repository.custom;

import com.eventtix.model.Events.Event;
import com.eventtix.repository.CrudRepository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends CrudRepository<Event,Long> {

}
