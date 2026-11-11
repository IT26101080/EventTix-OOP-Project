package com.eventtix.service.impl;

import com.eventtix.model.Customer;
import com.eventtix.repository.custom.CustomerRepository;
import com.eventtix.service.CustomerService;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final DataSource dataSource;

    public CustomerServiceImpl(CustomerRepository customerRepository, DataSource dataSource){
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
    }

    @Override
    public Customer createCustomer(Customer customer) throws SQLException {

        if (customer == null) {
            throw new IllegalArgumentException("Customer cannot be null");
        }

        try (
                Connection connection = dataSource.getConnection()
        ) {

            String newId = generateCustomerId(connection);
            customer.setId(newId);

            validCustomer(customer);

            boolean isCreated = customerRepository.create(customer, connection);

            if (!isCreated) {
                throw new IllegalStateException("Customer creation failed");
            }

            return customer;
        }
    }

    @Override
    public List<Customer> getAllCustomers() throws SQLException {
        try (
                Connection connection = dataSource.getConnection()
        ) {
            return customerRepository.findAll(connection);

        }
    }

    @Override
    public Customer getCustomerById(String customerId) throws SQLException {

        validateCustomerId(customerId);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return customerRepository.findById(customerId, connection).orElseThrow(() ->
                    new java.util.NoSuchElementException("Customer not found with ID: " + customerId)
            );
        }
    }

    @Override
    public boolean updateCustomer(String customerId, Customer customer) throws SQLException {
        validateCustomerId(customerId);

        if (customer == null) {
            throw new IllegalArgumentException("Customer cannot be null");
        }

        customer.setId(customerId);

        validCustomer(customer);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return customerRepository.update(customerId, customer, connection);
        }
    }

    @Override
    public boolean deleteCustomer(String customerId) throws SQLException {
        //validateCustomerId(customerId);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return customerRepository.deleteById(customerId, connection);
        }
    }




    private void validCustomer(Customer customer){

        if(customer == null){
            throw new IllegalArgumentException("Customer cannot be null");
        }

        if(customer.getName() == null || customer.getName().isBlank()){
            throw new IllegalArgumentException("Customer name is Required");
        }

        if(customer.getId() == null || customer.getId().isBlank()){
            throw new IllegalArgumentException("Customer ID is required");
        }

        if (customer.getEmail() == null || customer.getEmail().isBlank()){
            throw new IllegalArgumentException("Customer email is required");
        }

        if (customer.getPhone() == null || customer.getPhone().isBlank()) {
            throw new IllegalArgumentException("Customer phone number is required");
        }

        if (customer.getCity() == null || customer.getCity().isBlank()){
            throw new IllegalArgumentException("Customer City is required");
        }

        if (customer.getBookings() < 0) {
            throw new IllegalArgumentException("Bookings cannot be negative");
        }

    }

    public String generateCustomerId(Connection connection) throws SQLException{
        String lastCustomerId = customerRepository.getLastCustomerId(connection);


        if (lastCustomerId == null || lastCustomerId.isEmpty()) {
            return "B001";
        }

        int id = Integer.parseInt(lastCustomerId.substring(1));
        id++;

        String newCustomerId = String.format("B%03d", id);
        return newCustomerId;
    }

    private void validateCustomerId(String customerId) {
        if (customerId == null || !customerId.matches("B[0-9]{3,}")) {
            throw new IllegalArgumentException("Invalid Customer ID");
        }
    }

}
