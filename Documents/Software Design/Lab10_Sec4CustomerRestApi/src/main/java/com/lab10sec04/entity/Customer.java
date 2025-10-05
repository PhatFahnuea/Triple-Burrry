package com.lab10sec04.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "customer")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private Address address;

    public Customer() {}

    public Customer(String name, String email) {
        this.email = email;
        this.name = name;
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }

    public void setId(long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }

    public Address getAddress() { return address; }

    public void setAddress(Address address) {
        if (address == null) {
            if (this.address != null) this.address.setCustomer(null);
            this.address = null;
        } else {
            address.setCustomer(this);
            this.address = address;
        }
    }

    @Override
    public String toString() {
        return "Customer [id=" + id + ", name=" + name + ", email=" + email + "]";
    }
}
