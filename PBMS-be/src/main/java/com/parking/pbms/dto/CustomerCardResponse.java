package com.parking.pbms.dto;

import java.time.LocalDate;

public record CustomerCardResponse(
    Integer cardId,
    String cardNo,
    String rfidUid,
    String groupName,
    String ticketType,
    String plateNo,
    LocalDate registeredAt,
    LocalDate expireAt,
    String status,
    String note
) {}
