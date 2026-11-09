package com.eventtix.model.Events;

public class Customer {

    private String name;
    private String id;
    private String email;
    private String phone;
    private String city;
    private int bookings;

    public Customer() {
    }

    public Customer(String name, String id, String email, String phone, String city, int bookings) {
        this.name = name;
        this.id = id;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.bookings = bookings;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public int getBookings() {
        return bookings;
    }

    public void setBookings(int bookings) {
        this.bookings = bookings;
    }
}
