package com.eventtix.service.impl;

import com.eventtix.model.Event;
import com.eventtix.repository.custom.EventRepository;
import com.eventtix.service.EventService;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final DataSource dataSource;

    public EventServiceImpl(EventRepository eventRepository, DataSource dataSource){
        this.eventRepository = eventRepository;
        this.dataSource = dataSource;
    }

    @Override
    public Event createEvent(Event event) throws SQLException {
        validateEvent(event);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            boolean isCreated = eventRepository.create(event, connection);
            if (!isCreated) {
                throw new IllegalStateException("Event creation failed");
            }

            return event;
        }
    }

    @Override
    public List<Event> getAllEvents() throws SQLException {
        try (
                Connection connection = dataSource.getConnection()
        ) {
            return eventRepository.findAll(connection);

        }
    }

    @Override
    public Event getEventById(Long eventId) throws SQLException {

        validateEventId(eventId);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return eventRepository.findById(eventId, connection).orElseThrow(() ->
                            new java.util.NoSuchElementException("Event not found with ID: " + eventId)
                    );
        }
    }

    @Override
    public boolean updateEvent(Long eventId, Event event) throws SQLException {
        validateEventId(eventId);
        validateEvent(event);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return eventRepository.update(eventId, event, connection);
        }
    }

    @Override
    public boolean deleteEvent(Long eventId) throws SQLException {
        validateEventId(eventId);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return eventRepository.deleteById(eventId, connection);
        }
    }


    private void validateEvent(Event event){

        if(event == null){
            throw new IllegalArgumentException("Event cannot be null");
        }

        if(event.getName() == null || event.getName().isBlank()){
            throw new IllegalArgumentException("Event name is Required");
        }

        if(event.getCategory() == null || event.getCategory().isBlank()){
            throw new IllegalArgumentException("Event category is required");
        }

        if (event.getDateTime() == null){
            throw new IllegalArgumentException("Event date and time is required");
        }

        if (event.getVenue() == null || event.getVenue().isBlank()){
            throw new IllegalArgumentException("Event venue is required");
        }

        if (event.getTicketPrice() == null || event.getTicketPrice().signum() < 0){
            throw new IllegalArgumentException("Ticket price cannot be negative");
        }

        if (event.getCapacity() <= 0){
            throw new IllegalArgumentException("Capacity must be greater than zero");
        }

        if (event.getStatus() == null || event.getStatus().isBlank()){
            throw new IllegalArgumentException("Event status is required");
        }

    }

    private void validateEventId(Long eventId) {

        if (eventId == null || eventId <= 0) {
            throw new IllegalArgumentException("Invalid event ID");
        }
    }
}
