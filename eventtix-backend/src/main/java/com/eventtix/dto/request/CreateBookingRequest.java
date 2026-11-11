package com.eventtix.dto.request;

public class CreateBookingRequest {

    private String customerId;
    private Long eventId;
    private int ticketQuantity;

    public CreateBookingRequest() {
    }

    public String getCustomerId() {

        return customerId;
    }

    public void setCustomerId(String customerId) {

        this.customerId = customerId;
    }

    public Long getEventId() {

        return eventId;
    }

    public void setEventId(Long eventId) {

        this.eventId = eventId;
    }

    public int getTicketQuantity() {

        return ticketQuantity;
    }

    public void setTicketQuantity(int ticketQuantity) {

        this.ticketQuantity = ticketQuantity;
    }

}