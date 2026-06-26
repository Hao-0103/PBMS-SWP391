package com.parking.pbms.controller;

import com.parking.pbms.dto.ApiResponse;
import com.parking.pbms.dto.StaffAssignmentResponse;
import com.parking.pbms.dto.StaffCheckInRequest;
import com.parking.pbms.dto.StaffCheckOutRequest;
import com.parking.pbms.dto.StaffTicketResponse;
import com.parking.pbms.dto.StaffTransactionResponse;
import com.parking.pbms.model.Floor;
import com.parking.pbms.model.Lane;
import com.parking.pbms.service.AssignmentService;
import com.parking.pbms.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final AssignmentService assignmentService;

    @GetMapping("/lanes")
    public ResponseEntity<ApiResponse<List<Lane>>> getLanes() {
        List<Lane> lanes = staffService.getLanes();
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy danh sách làn xe thành công", lanes)
        );
    }

    @GetMapping("/floors")
    public ResponseEntity<ApiResponse<List<Floor>>> getFloors() {
        List<Floor> floors = staffService.getFloors();
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy danh sách tầng thành công", floors)
        );
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<StaffTicketResponse>> checkIn(
            @Valid @RequestBody StaffCheckInRequest request,
            Principal principal
    ) {
        String username = principal.getName();
        StaffTicketResponse response = staffService.checkIn(request, username);
        return ResponseEntity.ok(
                ApiResponse.success(200, response.message(), response)
        );
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<StaffTicketResponse>> checkOut(
            @Valid @RequestBody StaffCheckOutRequest request,
            Principal principal
    ) {
        String username = principal.getName();
        StaffTicketResponse response = staffService.checkOut(request, username);
        return ResponseEntity.ok(
                ApiResponse.success(200, response.message(), response)
        );
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<StaffTransactionResponse>>> getTransactionHistory(
            Principal principal
    ) {
        String username = principal.getName();
        List<StaffTransactionResponse> response = staffService.getTransactionHistory(username);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy lịch sử giao dịch thành công", response)
        );
    }

    @GetMapping("/active-assignment")
    public ResponseEntity<ApiResponse<StaffAssignmentResponse>> getActiveAssignment(
            Principal principal
    ) {
        String username = principal.getName();
        StaffAssignmentResponse response = assignmentService.getActiveAssignmentForStaff(username);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy phân công ca trực hôm nay thành công", response)
        );
    }
}
