package com.eventtix.repository.custom;

import com.eventtix.model.Customer;
import com.eventtix.repository.CrudRepository;

import java.sql.Connection;
import java.sql.SQLException;

public interface CustomerRepository extends CrudRepository<Customer,String> {
    String getLastCustomerId(Connection connection) throws SQLException;;
}
