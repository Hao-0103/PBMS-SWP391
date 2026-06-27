package com.parking.pbms.dto;

import lombok.Data;

@Data
public class CreatePayOSLinkRequest {
    private Long orderCode;
    private Integer amount;
    private String description;
    private String returnUrl;
    private String cancelUrl;
}
