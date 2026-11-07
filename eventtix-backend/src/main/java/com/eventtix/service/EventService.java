package com.eventtix.service;

import com.eventtix.model.Events.Event;

import java.sql.SQLException;
import java.util.List;

public interface EventService {
    Event createEvent(Event event) throws SQLException;
    List<Event> getAllEvents() throws SQLException;
    Event getEventById(Long eventId) throws SQLException;
    boolean updateEvent(Long eventId, Event event) throws SQLException;
    boolean deleteEvent(Long eventId) throws SQLException;
}
