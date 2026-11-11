package com.eventtix.service;

import com.eventtix.model.Customer;

import java.sql.SQLException;
import java.util.List;

public interface CustomerService {
    Customer createCustomer(Customer customer) throws SQLException;
    List<Customer> getAllCustomers() throws SQLException;
    Customer getCustomerById(String cusId) throws SQLException;
    boolean updateCustomer(String cusId, Customer customer) throws SQLException;
    boolean deleteCustomer(String cusId) throws SQLException;
}
