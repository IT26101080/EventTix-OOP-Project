package com.eventtix.dto.request;

// The data the Settings page sends when someone saves "My Profile".
// Notice: there is NO role and NO password here.
// That way a person can never make themselves an ADMIN from the settings page.
public class UpdateProfileRequest {

    private String fullName;
    private String username;
    private String email;

    public UpdateProfileRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
