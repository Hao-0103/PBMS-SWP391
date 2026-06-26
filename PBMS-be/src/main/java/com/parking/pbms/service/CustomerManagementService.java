package com.parking.pbms.service;

import com.parking.pbms.dto.CreateCustomerRequest;
import com.parking.pbms.dto.UpdateCustomerRequest;
import com.parking.pbms.dto.CustomerResponse;
import com.parking.pbms.dto.CustomerCardResponse;
import java.util.List;

public interface CustomerManagementService {
    List<CustomerResponse> getAllCustomers();
    List<CustomerCardResponse> getCustomerCards(Integer customerId);
    CustomerResponse createCustomer(CreateCustomerRequest request);
    CustomerResponse updateCustomer(Integer customerId, UpdateCustomerRequest request);
    CustomerResponse deleteCustomer(Integer customerId);
}
