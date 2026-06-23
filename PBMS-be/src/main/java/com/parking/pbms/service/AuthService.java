package com.parking.pbms.service;

import com.parking.pbms.dto.LoginRequest;
import com.parking.pbms.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}
