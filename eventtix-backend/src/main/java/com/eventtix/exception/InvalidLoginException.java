package com.eventtix.exception;

// We throw this when the username or password is wrong.
// GlobalExceptionHandler turns it into a 401 (Unauthorized) response.
public class InvalidLoginException extends RuntimeException {

    public InvalidLoginException(String message) {
        super(message);
    }
}
