
package com.eventtix.controller;

import com.eventtix.dto.request.CreateCustomerRequest;
import com.eventtix.model.Customer;
import com.eventtix.service.CustomerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    private Customer mapToCustomer(CreateCustomerRequest request) {
        Customer customer = new Customer();

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setCity(request.getCity());
        customer.setBookings(request.getBookings());

        return customer;
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody CreateCustomerRequest request) throws SQLException {

        Customer customer = mapToCustomer(request);
        Customer created = customerService.createCustomer(customer);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() throws SQLException {

        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable String id) throws SQLException {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateCustomer(@PathVariable String id, @RequestBody CreateCustomerRequest request) throws SQLException {

        Customer customer = mapToCustomer(request);

        boolean updated = customerService.updateCustomer(id, customer);

        if (!updated) {
            throw new NoSuchElementException("Customer not found: " + id);
        }

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) throws SQLException {

        boolean deleted = customerService.deleteCustomer(id);

        if (!deleted) {
            throw new NoSuchElementException("Customer not found: " + id);
        }
        return ResponseEntity.noContent().build();
    }
}
