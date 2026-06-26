package com.parking.pbms.controller;

import com.parking.pbms.dto.ApiResponse;
import com.parking.pbms.dto.CreateCustomerRequest;
import com.parking.pbms.dto.UpdateCustomerRequest;
import com.parking.pbms.dto.CustomerResponse;
import com.parking.pbms.dto.CustomerCardResponse;
import com.parking.pbms.service.CustomerManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class CustomerManagementController {

    private final CustomerManagementService customerManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        List<CustomerResponse> list = customerManagementService.getAllCustomers();
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy danh sách khách hàng thành công", list)
        );
    }

    @GetMapping("/{id}/cards")
    public ResponseEntity<ApiResponse<List<CustomerCardResponse>>> getCustomerCards(
            @PathVariable("id") Integer customerId
    ) {
        List<CustomerCardResponse> list = customerManagementService.getCustomerCards(customerId);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy danh sách thẻ của khách hàng thành công", list)
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request
    ) {
        CustomerResponse response = customerManagementService.createCustomer(request);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Tạo khách hàng mới thành công", response)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable("id") Integer id,
            @Valid @RequestBody UpdateCustomerRequest request
    ) {
        CustomerResponse response = customerManagementService.updateCustomer(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Cập nhật khách hàng thành công", response)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> deleteCustomer(
            @PathVariable("id") Integer id
    ) {
        CustomerResponse response = customerManagementService.deleteCustomer(id);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Vô hiệu hóa khách hàng thành công", response)
        );
    }
}
