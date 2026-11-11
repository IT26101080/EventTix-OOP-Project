
package com.eventtix.controller;

import com.eventtix.model.Booking;
import com.eventtix.queue.BookingRequestQueue;
import com.eventtix.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRequestQueue bookingRequestQueue;

    public BookingController(BookingService bookingService, BookingRequestQueue bookingRequestQueue) {

        this.bookingService = bookingService;
        this.bookingRequestQueue = bookingRequestQueue;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) throws SQLException {

        Booking created = bookingRequestQueue.processBooking(booking);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() throws SQLException {

        return ResponseEntity.ok(
                bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) throws SQLException {

        return ResponseEntity.ok(
                bookingService.getBookingById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBooking(
            @PathVariable String id,
            @RequestBody Booking booking) throws SQLException {

        bookingService.updateBooking(id, booking);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String id) throws SQLException {

        bookingService.deleteBooking(id);

        return ResponseEntity.noContent().build();
    }
}
