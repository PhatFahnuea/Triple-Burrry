package com.lab10sec04.repository;
import org.springframework.data.repository.CrudRepository;

import com.lab10sec04.entity.Customer;
public interface CustomerRepository extends CrudRepository<Customer,Long> {

}
