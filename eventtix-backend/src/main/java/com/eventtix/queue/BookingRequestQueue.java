
package com.eventtix.queue;

import com.eventtix.model.Booking;
import com.eventtix.service.BookingService;
import org.springframework.stereotype.Component;

import java.sql.SQLException;
import java.util.ArrayDeque;
import java.util.Queue;

@Component
public class BookingRequestQueue {

    private final Queue<Booking> queue = new ArrayDeque<>();
    private final BookingService bookingService;

    public BookingRequestQueue(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    public synchronized Booking processBooking(Booking booking)
            throws SQLException {


        queue.offer(booking);


        Booking nextBooking = queue.poll();

        return bookingService.createBooking(nextBooking);
    }
}
