
package com.eventtix.service;

import com.eventtix.model.Booking;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public interface BookingService {
    Booking createBooking(Booking booking) throws SQLException;
    List<Booking> getAllBookings() throws SQLException;
    Booking getBookingById(String id) throws SQLException;
    boolean updateBooking(String id, Booking booking) throws SQLException;
    boolean deleteBooking(String id) throws SQLException;
}
