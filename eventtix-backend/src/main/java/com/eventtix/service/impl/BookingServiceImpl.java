
package com.eventtix.service.impl;

import com.eventtix.model.Booking;
import com.eventtix.model.Customer;
import com.eventtix.model.Event;
import com.eventtix.repository.custom.BookingRepository;
import com.eventtix.repository.custom.CustomerRepository;
import com.eventtix.repository.custom.EventRepository;
import com.eventtix.service.BookingService;

import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class BookingServiceImpl implements BookingService {

    private final DataSource dataSource;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final EventRepository eventRepository;

    public BookingServiceImpl(
            DataSource dataSource,
            BookingRepository bookingRepository,
            CustomerRepository customerRepository,
            EventRepository eventRepository) {

        this.dataSource = dataSource;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.eventRepository = eventRepository;
    }


    @Override
    public Booking createBooking(Booking booking) throws SQLException {
        validateBooking(booking);

        try (Connection connection = dataSource.getConnection()) {

            connection.setAutoCommit(false);

            try {
                Customer customer = customerRepository.findById(booking.getCustomerId(), connection)
                        .orElseThrow(() -> new NoSuchElementException("Customer not found"));

                Event event = eventRepository.findByIdForUpdate(booking.getEventId(), connection)
                        .orElseThrow(() -> new NoSuchElementException("Event not found"));


                int reserved = bookingRepository.getReservedTicketCount(booking.getEventId(), connection);

                int available = event.getCapacity() - reserved;

                if (booking.getTicketQuantity() > available) {
                    throw new IllegalArgumentException("Not enough tickets available");
                }

                BigDecimal total = event.getTicketPrice().multiply(BigDecimal.valueOf(booking.getTicketQuantity()));

                booking.setTotalAmount(total);

                booking.setBookingId(generateBookingId(connection));
                booking.setBookedOn(LocalDateTime.now());
                booking.setStatus("Confirmed");

                boolean created = bookingRepository.create(booking, connection);

                if (!created) {
                    throw new SQLException("Failed to create booking");
                }

                customer.setBookings(customer.getBookings() + 1);

                boolean updated = customerRepository.update(customer.getId(), customer, connection);

                if (!updated) {
                    throw new SQLException("Failed to update customer booking count");
                }

                connection.commit();

                return booking;

            } catch (Exception ex) {

                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    ex.addSuppressed(rollbackEx);
                }

                if (ex instanceof SQLException sqlEx) {
                    throw sqlEx;
                }

                if (ex instanceof RuntimeException runtimeEx) {
                    throw runtimeEx;
                }

                throw new SQLException("Booking transaction failed", ex);
            }
        }
    }

    @Override
    public List<Booking> getAllBookings() throws SQLException {

        try (Connection connection = dataSource.getConnection()) {
            return bookingRepository.findAll(connection);
        }
    }

    @Override
    public Booking getBookingById(String id) throws SQLException {
        validateBookingId(id);

        try (Connection connection = dataSource.getConnection()) {

            return bookingRepository.findById(id, connection).orElseThrow(() ->
                    new NoSuchElementException("Booking not found: " + id));
        }
    }

    @Override
    public boolean updateBooking(String id, Booking booking) throws SQLException {

            validateBookingId(id);

            if (booking == null) {
                throw new IllegalArgumentException("Booking cannot be null");
            }

            if (booking.getTicketQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Ticket quantity must be greater than zero");
            }

            if (booking.getStatus() == null ||
                    !List.of("Confirmed", "Pending", "Cancelled")
                            .contains(booking.getStatus())) {
                throw new IllegalArgumentException("Invalid booking status");
            }

            try (Connection connection = dataSource.getConnection()) {

                connection.setAutoCommit(false);

                try {

                    Booking existing = bookingRepository.findById(id, connection).orElseThrow(() ->
                            new NoSuchElementException("Booking not found: " + id));


                    Event event = eventRepository.findByIdForUpdate(existing.getEventId(), connection).orElseThrow(() ->
                            new NoSuchElementException("Event not found"));


                    int reserved = bookingRepository.getReservedTicketCount(existing.getEventId(), connection);


                    boolean oldActive = !existing.getStatus().equals("Cancelled");

                    boolean newActive = !booking.getStatus().equals("Cancelled");

                    int reservedWithoutOld = reserved - (oldActive ? existing.getTicketQuantity() : 0);

                    int newReserved = reservedWithoutOld + (newActive ? booking.getTicketQuantity() : 0);

                    if (newReserved > event.getCapacity()) {
                        throw new IllegalArgumentException("Not enough tickets available");
                    }


                    booking.setBookingId(existing.getBookingId());
                    booking.setCustomerId(existing.getCustomerId());
                    booking.setEventId(existing.getEventId());
                    booking.setBookedOn(existing.getBookedOn());


                    booking.setTotalAmount(event.getTicketPrice().multiply(BigDecimal.valueOf(booking.getTicketQuantity())));

                    boolean updated = bookingRepository.update(id, booking, connection);

                    if (!updated) {
                        throw new SQLException("Booking update failed");
                    }

                    connection.commit();
                    return true;

                } catch (Exception ex) {

                    try {
                        connection.rollback();
                    } catch (SQLException rollbackEx) {
                        ex.addSuppressed(rollbackEx);
                    }

                    if (ex instanceof SQLException sqlEx) {
                        throw sqlEx;
                    }

                    if (ex instanceof RuntimeException runtimeEx) {
                        throw runtimeEx;
                    }

                    throw new SQLException("Booking update failed", ex);
                }
            }
    }

    @Override
    public boolean deleteBooking(String id) throws SQLException {
        validateBookingId(id);

        try (Connection connection = dataSource.getConnection()) {

            connection.setAutoCommit(false);

            try {

                Booking existing = bookingRepository.findById(id, connection).orElseThrow(() ->
                        new NoSuchElementException("Booking not found: " + id));


                eventRepository.findByIdForUpdate(existing.getEventId(), connection).orElseThrow(() ->
                        new NoSuchElementException("Event not found"));


                Customer customer = customerRepository.findById(existing.getCustomerId(), connection).orElseThrow(() ->
                        new NoSuchElementException("Customer not found"));


                boolean deleted = bookingRepository.deleteById(id, connection);

                if (!deleted) {
                    throw new SQLException("Booking deletion failed");
                }


                customer.setBookings(Math.max(0, customer.getBookings() - 1));

                boolean updated = customerRepository.update(customer.getId(), customer, connection);

                if (!updated) {
                    throw new SQLException("Failed to update customer booking count");
                }

                connection.commit();
                return true;

            } catch (Exception ex) {

                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    ex.addSuppressed(rollbackEx);
                }

                if (ex instanceof SQLException sqlEx) {
                    throw sqlEx;
                }

                if (ex instanceof RuntimeException runtimeEx) {
                    throw runtimeEx;
                }

                throw new SQLException("Booking deletion failed", ex);
            }
        }
    }



    private void validateBooking(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }

        if (booking.getCustomerId() == null ||
                booking.getCustomerId().isBlank()) {
            throw new IllegalArgumentException("Customer ID is required");
        }

        if (booking.getEventId() == null) {
            throw new IllegalArgumentException("Event ID is required");
        }

        if (booking.getTicketQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Ticket quantity must be greater than zero");
        }
    }


    private String generateBookingId(Connection connection) throws SQLException {

        String lastId = bookingRepository.getLastBookingId(connection);

        if (lastId == null || lastId.isBlank()) {
            return "#1001";
        }

        int number = Integer.parseInt(lastId.substring(1));

        return "#" + (number + 1);
    }

    private void validateBookingId(String id) {

        if (id == null || !id.matches("#[0-9]+")) {
            throw new IllegalArgumentException("Invalid Booking ID");
        }
    }

}
