package com.eventtix.repository.custom.impl;

import com.eventtix.model.Customer;
import com.eventtix.repository.custom.CustomerRepository;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class CustomerRepositoryImpl implements CustomerRepository {
    @Override
    public boolean create(Customer customer, Connection connection) throws SQLException {
        String sql = "INSERT INTO customers (customer_id, name, email, phone, city, bookings) VALUES (?, ?, ?, ?, ?, ?)";

        try (
                PreparedStatement pstm = connection.prepareStatement(sql)
        ) {
            pstm.setString(1, customer.getId());
            pstm.setString(2, customer.getName());
            pstm.setString(3, customer.getEmail());
            pstm.setString(4, customer.getPhone());
            pstm.setString(5, customer.getCity());
            pstm.setInt(6, customer.getBookings());

            return pstm.executeUpdate() > 0;
        }
    }

    @Override
    public List<Customer> findAll(Connection connection) throws SQLException {
        String sql = "SELECT * FROM customers";

        ArrayList<Customer> customerList = new ArrayList<>();
        try(
                PreparedStatement pstm = connection.prepareStatement(sql);
                ResultSet rs = pstm.executeQuery();

        ){

            while (rs.next()) {
                Customer customer = mapCustomer(rs);
                customerList.add(customer);
            }
        }

        return customerList;
    }

    @Override
    public Optional<Customer> findById(String id, Connection connection) throws SQLException {
        try(
                PreparedStatement ps = connection.prepareStatement("SELECT * FROM customers WHERE customer_id = ?")
        ) {
            ps.setString(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Customer customer = mapCustomer(rs);
                    return Optional.of(customer);
                }
                return Optional.empty();
            }
        }
    }

    @Override
    public boolean update(String id, Customer customer, Connection connection) throws SQLException {
        String sql = " UPDATE customers SET  name = ?, email = ?, phone = ?, city = ?, bookings = ? WHERE customer_id = ? ";

        try(
                PreparedStatement pstm = connection.prepareStatement(sql)
        ) {
            pstm.setString(1, customer.getName());
            pstm.setString(2, customer.getEmail());
            pstm.setString(3, customer.getPhone());
            pstm.setString(4, customer.getCity());
            pstm.setInt(5, customer.getBookings());
            pstm.setString(6, id);


            return pstm.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteById(String id, Connection connection) throws SQLException {
        String sql = "DELETE FROM customers WHERE customer_id = ?";
        try(
                PreparedStatement pstm = connection.prepareStatement(sql)
        ) {

            pstm.setString(1, id);
            return pstm.executeUpdate() > 0;
        }
    }


    private Customer mapCustomer(ResultSet resultSet) throws SQLException {

        Customer customer = new Customer();

        customer.setId(resultSet.getString("customer_id"));
        customer.setName(resultSet.getString("name"));
        customer.setEmail(resultSet.getString("email"));

        customer.setPhone(resultSet.getString("phone"));
        customer.setCity(resultSet.getString("city"));
        customer.setBookings(resultSet.getInt("bookings"));

        return customer;
    }

    @Override
    public String getLastCustomerId(Connection connection) throws SQLException {
        String sql = "SELECT customer_id FROM customers ORDER BY customer_id DESC LIMIT 1";

        try (
                PreparedStatement pstm = connection.prepareStatement(sql);
                ResultSet rs = pstm.executeQuery()
        ) {
            if (rs.next()) {
                return rs.getString("customer_id");
            }

            return null;
        }
    }
}
