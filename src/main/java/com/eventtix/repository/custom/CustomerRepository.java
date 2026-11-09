package com.eventtix.repository.custom;

import com.eventtix.model.Events.Customer;
import com.eventtix.repository.CrudRepository;

public interface CustomerRepository extends CrudRepository<Customer,String> {
}
