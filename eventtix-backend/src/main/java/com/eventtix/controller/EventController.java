
package com.eventtix.controller;

import com.eventtix.model.Event;
import com.eventtix.service.EventService;
import com.eventtix.dto.request.CreateEventRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody CreateEventRequest request) throws SQLException {

        Event event = new Event();

        event.setName(request.getName());
        event.setCategory(request.getCategory());
        event.setDateTime(request.getDateTime());
        event.setVenue(request.getVenue());
        event.setTicketPrice(request.getTicketPrice());
        event.setCapacity(request.getCapacity());
        event.setStatus(request.getStatus());
        event.setDescription(request.getDescription());

        Event createdEvent = eventService.createEvent(event);


        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }


    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() throws SQLException {

        List<Event> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }


    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getEventById(@PathVariable Long eventId) throws SQLException {

        Event event = eventService.getEventById(eventId);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<Void> updateEvent(@PathVariable Long eventId , @RequestBody CreateEventRequest request) throws SQLException{

        Event event = new Event();

        event.setName(request.getName());
        event.setCategory(request.getCategory());
        event.setDateTime(request.getDateTime());
        event.setVenue(request.getVenue());
        event.setTicketPrice(request.getTicketPrice());
        event.setCapacity(request.getCapacity());
        event.setStatus(request.getStatus());
        event.setDescription(request.getDescription());

        boolean isUpdated = eventService.updateEvent(eventId, event);

        if(!isUpdated){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) throws SQLException {

        boolean isDeleted = eventService.deleteEvent(eventId);

        if (!isDeleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }



}
