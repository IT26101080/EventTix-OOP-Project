package com.eventtix.repository.custom.impl;

import com.eventtix.model.Events.Event;
import com.eventtix.repository.custom.EventRepository;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class EventRepositoryImpl implements EventRepository {


    @Override
    public boolean create(Event event, Connection connection) throws SQLException {
        String sql = "INSERT INTO events(name, category, date_time, venue, ticket_price, capacity, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try(
            PreparedStatement pstm = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)
        ){
            pstm.setString(1, event.getName());
            pstm.setString(2, event.getCategory());
            pstm.setTimestamp(3, Timestamp.valueOf(event.getDateTime()));
            pstm.setString(4, event.getVenue());
            pstm.setBigDecimal(5, event.getTicketPrice());
            pstm.setInt(6, event.getCapacity());
            pstm.setString(7, event.getStatus());
            pstm.setString(8, event.getDescription());

            int affectedRows = pstm.executeUpdate();

            if (affectedRows == 0) {
                return false;
            }

            try (ResultSet keys = pstm.getGeneratedKeys()) {
                if (keys.next()) {
                    event.setEventId(keys.getLong(1));
                    return true;
                }

                throw new SQLException("Failed to retrieve generated event ID");
            }
        }

    }

    @Override
    public List<Event> findAll(Connection connection) throws SQLException{
        String sql = "SELECT * FROM events";

        ArrayList<Event> eventList = new ArrayList<>();
        try(
            PreparedStatement pstm = connection.prepareStatement(sql);
            ResultSet rs = pstm.executeQuery();

        ){

            while (rs.next()) {
                Event event = mapEvent(rs);
                eventList.add(event);
            }
        }

        return eventList;
    }


    @Override
    public Optional<Event> findById(Long id , Connection connection) throws SQLException {

        try(
        PreparedStatement ps = connection.prepareStatement("SELECT * FROM events WHERE id = ?")
        ) {
            ps.setLong(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Event event = mapEvent(rs);
                    return Optional.of(event);
                }
                return Optional.empty();
            }
        }
    }

    @Override
    public boolean update(Long id, Event event, Connection connection) throws SQLException {
            String sql = " UPDATE events SET name = ?, category = ?, date_time = ?, venue = ?, ticket_price = ?, capacity = ?, status = ?, description = ? WHERE id = ? ";

            try(
                PreparedStatement pstm = connection.prepareStatement(sql)
            ) {
                pstm.setString(1, event.getName());
                pstm.setString(2, event.getCategory());
                pstm.setTimestamp(3, Timestamp.valueOf(event.getDateTime()));
                pstm.setString(4, event.getVenue());
                pstm.setBigDecimal(5, event.getTicketPrice());
                pstm.setInt(6, event.getCapacity());
                pstm.setString(7, event.getStatus());
                pstm.setString(8, event.getDescription());
                pstm.setLong(9, id);


                return pstm.executeUpdate() > 0;
            }
    }

    @Override
    public boolean deleteById(Long id, Connection connection) throws SQLException {
        String sql = "DELETE FROM events WHERE id = ?";
        try(
            PreparedStatement pstm = connection.prepareStatement(sql)
        ) {

            pstm.setLong(1, id);
            return pstm.executeUpdate() > 0;
        }
    }


    private Event mapEvent(ResultSet resultSet) throws SQLException {

        Event event = new Event();

        event.setEventId(resultSet.getLong("id"));
        event.setName(resultSet.getString("name"));
        event.setCategory(resultSet.getString("category"));

        event.setDateTime(resultSet.getTimestamp("date_time").toLocalDateTime());
        event.setVenue(resultSet.getString("venue"));
        event.setTicketPrice(resultSet.getBigDecimal("ticket_price"));
        event.setCapacity(resultSet.getInt("capacity"));
        event.setStatus(resultSet.getString("status"));
        event.setDescription(resultSet.getString("description"));

        return event;
    }
}
