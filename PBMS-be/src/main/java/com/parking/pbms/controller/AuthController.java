package com.parking.pbms.controller;

import com.parking.pbms.dto.ApiResponse;
import com.parking.pbms.dto.LoginRequest;
import com.parking.pbms.dto.LoginResponse;
import com.parking.pbms.service.AuthService;
import com.parking.pbms.service.LogoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final LogoutService logoutService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        200,
                        "Đăng nhập thành công",
                        response
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(Principal principal) {
        String username = principal.getName();
        logoutService.logout(username);

        return ResponseEntity.ok(
                ApiResponse.success(
                        200,
                        "Đăng xuất thành công",
                        "Đã đăng xuất"
                )
        );
    }
}
