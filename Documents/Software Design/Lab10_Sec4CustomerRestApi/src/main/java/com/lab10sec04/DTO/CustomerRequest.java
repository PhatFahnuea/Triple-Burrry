package com.lab10sec04.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CustomerRequest {
    @NotBlank(message="customerName must not be blank")
    private String name;

    @NotBlank(message="Email must not be blank")
    @Email(message="Email must be valid")
    private String email;

    private AddressRequest address; 

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public AddressRequest getAddress() { return address; }
    public void setAddress(AddressRequest address) { this.address = address; }
}
