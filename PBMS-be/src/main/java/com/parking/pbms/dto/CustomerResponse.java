package com.parking.pbms.dto;

import java.time.LocalDateTime;

public record CustomerResponse(
    Integer customerId,
    String customerCode,
    Integer accountId,
    String fullName,
    String phone,
    String email,
    String address,
    String note,
    String status,
    LocalDateTime createdAt,
    Integer monthlyCardCount
) {}
