package com.lab10sec04.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.lab10sec04.entity.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {}
