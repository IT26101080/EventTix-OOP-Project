
package com.eventtix.repository.custom.impl;

import com.eventtix.model.Booking;
import com.eventtix.repository.custom.BookingRepository;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class BookingRepositoryImpl implements BookingRepository {

    @Override
    public boolean create(Booking booking, Connection connection) throws SQLException {
        String sql = "INSERT INTO bookings (booking_id, customer_id, event_id, ticket_quantity, total_amount, booked_on, status) VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstm = connection.prepareStatement(sql)) {

            pstm.setString(1, booking.getBookingId());
            pstm.setString(2, booking.getCustomerId());
            pstm.setLong(3, booking.getEventId());
            pstm.setInt(4, booking.getTicketQuantity());
            pstm.setBigDecimal(5, booking.getTotalAmount());
            pstm.setTimestamp(6, Timestamp.valueOf(booking.getBookedOn()));
            pstm.setString(7, booking.getStatus());

            return pstm.executeUpdate() > 0;
        }
    }

    @Override
    public List<Booking> findAll(Connection connection) throws SQLException {
        String sql = "SELECT * FROM bookings";

        List<Booking> bookingList = new ArrayList<>();

        try (
                PreparedStatement pstm = connection.prepareStatement(sql);
                ResultSet rs = pstm.executeQuery()
        ) {
            while (rs.next()) {
                Booking booking = mapBooking(rs);
                bookingList.add(booking);
            }
        }

        return bookingList;
    }

    @Override
    public Optional<Booking> findById(String id , Connection connection) throws SQLException {
        String sql = "SELECT * FROM bookings WHERE booking_id = ?";

        try (PreparedStatement pstm = connection.prepareStatement(sql)) {

            pstm.setString(1, id);

            try (ResultSet rs = pstm.executeQuery()) {

                if (rs.next()) {
                    return Optional.of(mapBooking(rs));
                }

                return Optional.empty();
            }
        }
    }

    @Override
    public boolean update(String id , Booking booking, Connection connection) throws SQLException {
        String sql = "UPDATE bookings SET  customer_id = ?, event_id = ?, ticket_quantity = ?, total_amount = ?, booked_on = ?, status = ? WHERE booking_id = ?";

        try (PreparedStatement pstm = connection.prepareStatement(sql)) {

            pstm.setString(1, booking.getCustomerId());
            pstm.setLong(2, booking.getEventId());
            pstm.setInt(3, booking.getTicketQuantity());
            pstm.setBigDecimal(4, booking.getTotalAmount());
            pstm.setTimestamp(5,
                    Timestamp.valueOf(booking.getBookedOn()));
            pstm.setString(6, booking.getStatus());
            pstm.setString(7, id);

            return pstm.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteById(String id, Connection connection) throws SQLException {
        String sql = "DELETE FROM bookings WHERE booking_id = ?";

        try (PreparedStatement pstm = connection.prepareStatement(sql)) {

            pstm.setString(1, id);

            return pstm.executeUpdate() > 0;
        }
    }

    @Override
    public String getLastBookingId(Connection connection) throws SQLException {
        String sql = "SELECT booking_id FROM bookings ORDER BY booking_id DESC LIMIT 1";

        try (
                PreparedStatement pstm = connection.prepareStatement(sql);
                ResultSet rs = pstm.executeQuery()
        ) {
            if (rs.next()) {
                return rs.getString("booking_id");
            }

            return null;
        }
    }


    private Booking mapBooking(ResultSet rs) throws SQLException {

        Booking booking = new Booking();

        booking.setBookingId(rs.getString("booking_id"));
        booking.setCustomerId(rs.getString("customer_id"));
        booking.setEventId(rs.getLong("event_id"));
        booking.setTicketQuantity(rs.getInt("ticket_quantity"));
        booking.setTotalAmount(rs.getBigDecimal("total_amount"));

        booking.setBookedOn(
                rs.getTimestamp("booked_on").toLocalDateTime()
        );

        booking.setStatus(rs.getString("status"));

        return booking;
    }


    @Override
    public int getReservedTicketCount(
            Long eventId, Connection connection) throws SQLException {

        String sql = "SELECT COALESCE(SUM(ticket_quantity), 0) FROM bookings WHERE event_id = ? AND status IN ('Confirmed', 'Pending')";

        try (PreparedStatement pstm = connection.prepareStatement(sql)) {

            pstm.setLong(1, eventId);

            try (ResultSet rs = pstm.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        return 0;
    }


}
