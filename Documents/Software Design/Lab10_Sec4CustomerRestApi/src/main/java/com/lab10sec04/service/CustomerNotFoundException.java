package com.lab10sec04.service;

public class CustomerNotFoundException extends RuntimeException {
	public CustomerNotFoundException(long id) { 
		super("Could not find Customer :"+id);
    }
}
