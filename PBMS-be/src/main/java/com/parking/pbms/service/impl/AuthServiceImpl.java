package com.parking.pbms.service.impl;

import com.parking.pbms.dto.LoginRequest;
import com.parking.pbms.dto.LoginResponse;
import com.parking.pbms.model.Account;
import com.parking.pbms.repository.AccountRepository;
import com.parking.pbms.service.AuthService;
import com.parking.pbms.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final AccountRepository accountRepository;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        Account account = accountRepository
                .findByUsernameIgnoreCase(request.username())
                .orElseThrow();

        account.setLastLoginAt(LocalDateTime.now());
        accountRepository.save(account);

        String accessToken =
                jwtService.generateToken(account);

        String roleName = account.getRoleName();

        return new LoginResponse(
                accessToken,
                "Bearer",
                jwtService.getJwtExpirationMs(),
                account.getAccountId(),
                account.getUsername(),
                account.getFullName(),
                roleName != null ? roleName.toLowerCase(Locale.ROOT) : ""
        );
    }
}
