
package com.eventtix.repository.custom;

import com.eventtix.model.Booking;
import com.eventtix.repository.CrudRepository;

import java.sql.Connection;
import java.sql.SQLException;

public interface BookingRepository extends CrudRepository<Booking, String> {

    String getLastBookingId(Connection connection)throws SQLException;
    int getReservedTicketCount(Long eventId, Connection connection) throws SQLException;
}
