package com.eventtix.service.impl;

import com.eventtix.model.Events.Customer;
import com.eventtix.model.Events.Event;
import com.eventtix.repository.custom.CustomerRepository;
import com.eventtix.repository.custom.EventRepository;
import com.eventtix.service.CustomerService;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final DataSource dataSource;

    public CustomerServiceImpl(CustomerRepository customerRepository, DataSource dataSource){
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
    }

    public Customer createCustomer(Customer customer) throws SQLException {
        validCustomer(customer);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            boolean isCreated = customerRepository.create(customer, connection);
            if (!isCreated) {
                throw new IllegalStateException("Event creation failed");
            }

            return customer;
        }
    }

    public List<Customer> getAllCustomer() throws SQLException {
        try (
                Connection connection = dataSource.getConnection()
        ) {
            return customerRepository.findAll(connection);

        }
    }

    public Customer getCustomerById(String customerId) throws SQLException {

//        validateCustomerId(customerId);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return customerRepository.findById(customerId, connection).orElseThrow(() ->
                    new java.util.NoSuchElementException("Customer not found with ID: " + customerId)
            );
        }
    }

    public boolean updateCustomer(String customerId, Customer customer) throws SQLException {
//        validateCustomerId(customerId);
//        validateCustomer(customer);

        try (
                Connection connection = dataSource.getConnection()
        ) {

            return customerRepository.update(customerId, customer, connection);
        }
    }

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
            throw new IllegalArgumentException("Booking should be greater than 0");
        }

    }


}
