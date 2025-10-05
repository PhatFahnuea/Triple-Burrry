package com.lab10sec04.service;

import java.util.List;
import java.util.stream.StreamSupport;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lab10sec04.DTO.AddressRequest;
import com.lab10sec04.DTO.AddressResponse;
import com.lab10sec04.DTO.CustomerRequest;
import com.lab10sec04.DTO.CustomerResponse;
import com.lab10sec04.entity.Address;
import com.lab10sec04.entity.Customer;
import com.lab10sec04.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository repoCust;

    public CustomerService(CustomerRepository repoCust) {
        this.repoCust = repoCust;
    }

    // ---------- Mapping helpers ----------
    private AddressResponse toAddressResponse(Address a) {
        if (a == null) return null;
        return new AddressResponse(
                a.getId(),
                a.getLine1(),
                a.getLine2(),
                a.getCity(),
                a.getState(),
                a.getPostalCode(),
                a.getCountry()
        );
    }

    private CustomerResponse toCustomerResponse(Customer c) {
        return new CustomerResponse(
                c.getId(),
                c.getName(),
                c.getEmail(),
                toAddressResponse(c.getAddress())
        );
    }

    private Customer toEntity(CustomerRequest req) {
        Customer c = new Customer();
        c.setName(req.getName());
        c.setEmail(req.getEmail());

        AddressRequest ar = req.getAddress();
        if (ar != null) {
            Address a = new Address();
            a.setLine1(ar.line1());
            a.setLine2(ar.line2());
            a.setCity(ar.city());
            a.setState(ar.state());
            a.setPostalCode(ar.postalCode());
            a.setCountry(ar.country());
            // sync สองฝั่ง (+cascade save ที่กำหนดใน Customer)
            c.setAddress(a);
        }
        return c;
    }

    private void applyUpdate(Customer target, CustomerRequest req) {
        target.setName(req.getName());
        target.setEmail(req.getEmail());

        AddressRequest ar = req.getAddress();
        if (ar == null) {
            // ถ้า body ไม่ส่ง address มาเลย: ลบความสัมพันธ์ทิ้ง
            target.setAddress(null);
        } else {
            Address addr = target.getAddress();
            if (addr == null) addr = new Address();
            addr.setLine1(ar.line1());
            addr.setLine2(ar.line2());
            addr.setCity(ar.city());
            addr.setState(ar.state());
            addr.setPostalCode(ar.postalCode());
            addr.setCountry(ar.country());
            target.setAddress(addr); // sync ฝั่ง customer ↔ address
        }
    }

    // ---------- CRUD ----------
    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomerList() {
        // ถ้าใช้ CrudRepository ให้แปลง Iterable -> List เอง
        return StreamSupport.stream(repoCust.findAll().spliterator(), false)
                .map(this::toCustomerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(long id) {
        Customer c = repoCust.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        return toCustomerResponse(c);
    }

    @Transactional
    public CustomerResponse save(CustomerRequest req) {
        Customer c = toEntity(req);
        Customer saved = repoCust.save(c);
        return toCustomerResponse(saved);
    }

    @Transactional
    public CustomerResponse addCustomer(CustomerRequest req) {
        // เหมือน save() แต่คงชื่อเมธอดไว้ตามที่ Controller เดิมเรียก
        Customer c = toEntity(req);
        Customer saved = repoCust.save(c);
        return toCustomerResponse(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(long id, CustomerRequest req) {
        Customer exist = repoCust.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));

        applyUpdate(exist, req);
        Customer saved = repoCust.save(exist);
        return toCustomerResponse(saved);
    }

    @Transactional
    public void deleteCustomerById(long id) {
        Customer c = repoCust.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
        repoCust.delete(c);
    }
}
