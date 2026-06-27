package com.parking.pbms.service.impl;

import com.parking.pbms.dto.CreateCustomerRequest;
import com.parking.pbms.dto.UpdateCustomerRequest;
import com.parking.pbms.dto.CustomerResponse;
import com.parking.pbms.dto.CustomerCardResponse;
import com.parking.pbms.model.*;
import com.parking.pbms.repository.*;
import com.parking.pbms.repository.CustomerRepository;
import com.parking.pbms.service.CustomerManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerManagementServiceImpl implements CustomerManagementService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CardRepository cardRepository;
    private final CardGroupRepository cardGroupRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<CustomerResponse> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<CustomerCardResponse> getCustomerCards(Integer customerId) {
        List<Card> cards = cardRepository.findMonthlyAndDayCardsByCustomerId(customerId);
        return cards.stream().map(card -> {
            String groupName = "";
            String ticketType = "";
            if (card.getCardGroupId() != null) {
                CardGroup cg = cardGroupRepository.findById(card.getCardGroupId()).orElse(null);
                if (cg != null) {
                    groupName = cg.getGroupName();
                    ticketType = cg.getTicketType();
                }
            }

            String plateNo = "";
            if (card.getVehicleId() != null) {
                Vehicle v = vehicleRepository.findById(card.getVehicleId()).orElse(null);
                if (v != null) {
                    plateNo = v.getPlateNo();
                }
            }

            return new CustomerCardResponse(
                    card.getCardId(),
                    card.getCardNo(),
                    card.getRfidUid(),
                    groupName,
                    ticketType,
                    plateNo,
                    card.getRegisteredAt(),
                    card.getExpireAt(),
                    card.getStatus(),
                    card.getNote()
            );
        }).toList();
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        String phone = request.phone().trim();
        if (accountRepository.findByUsernameIgnoreCase(phone).isPresent()) {
            throw new RuntimeException("Tài khoản với số điện thoại này đã tồn tại.");
        }

        Role role = roleRepository.findByRoleNameIgnoreCase("USER")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò USER"));

        Account account = Account.builder()
                .role(role)
                .username(phone)
                .fullName(request.fullName().trim())
                .passwordHash(passwordEncoder.encode("123456")) // Default password
                .email(request.email() != null ? request.email().trim() : null)
                .phone(phone)
                .status("ACTIVE")
                .build();

        Account savedAccount = accountRepository.saveAndFlush(account);

        Customer customer = Customer.builder()
                .accountId(savedAccount.getAccountId())
                .fullName(savedAccount.getFullName())
                .phone(phone)
                .email(savedAccount.getEmail())
                .address(request.address() != null ? request.address().trim() : "")
                .note(request.note() != null ? request.note().trim() : "")
                .status("ACTIVE")
                .build();
        Customer savedCustomer = customerRepository.saveAndFlush(customer);

        User user = User.builder()
                .accountId(savedAccount.getAccountId())
                .customerId(savedCustomer.getCustomerId())
                .fullName(savedAccount.getFullName())
                .phone(phone)
                .email(savedAccount.getEmail() != null ? savedAccount.getEmail() : "")
                .address(request.address() != null ? request.address().trim() : "")
                .status("ACTIVE")
                .build();
        userRepository.save(user);

        return mapToResponse(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Integer customerId, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));

        customer.setFullName(request.fullName().trim());
        customer.setPhone(request.phone().trim());
        customer.setEmail(request.email() != null ? request.email().trim() : null);
        customer.setAddress(request.address() != null ? request.address().trim() : null);
        customer.setNote(request.note() != null ? request.note().trim() : null);
        customer.setStatus(request.status().trim().toUpperCase());
        Customer saved = customerRepository.saveAndFlush(customer);

        if (customer.getAccountId() != null) {
            accountRepository.findById(customer.getAccountId()).ifPresent(acc -> {
                acc.setFullName(saved.getFullName());
                acc.setEmail(saved.getEmail());
                acc.setPhone(saved.getPhone());
                acc.setStatus(saved.getStatus());
                accountRepository.save(acc);
            });

            userRepository.findByAccountId(customer.getAccountId()).ifPresent(u -> {
                u.setFullName(saved.getFullName());
                u.setEmail(saved.getEmail() != null ? saved.getEmail() : "");
                u.setPhone(saved.getPhone());
                u.setAddress(saved.getAddress() != null ? saved.getAddress() : "");
                u.setStatus(saved.getStatus());
                userRepository.save(u);
            });
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public CustomerResponse deleteCustomer(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng với ID: " + customerId));

        customer.setStatus("INACTIVE");
        Customer saved = customerRepository.saveAndFlush(customer);

        if (customer.getAccountId() != null) {
            accountRepository.findById(customer.getAccountId()).ifPresent(acc -> {
                acc.setStatus("INACTIVE");
                accountRepository.save(acc);
            });

            userRepository.findByAccountId(customer.getAccountId()).ifPresent(u -> {
                u.setStatus("INACTIVE");
                userRepository.save(u);
            });
        }

        return mapToResponse(saved);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        List<Card> cards = cardRepository.findMonthlyAndDayCardsByCustomerId(customer.getCustomerId());
        int cardCount = cards != null ? cards.size() : 0;

        return new CustomerResponse(
                customer.getCustomerId(),
                customer.getCustomerCode(),
                customer.getAccountId(),
                customer.getFullName(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getNote(),
                customer.getStatus(),
                customer.getCreatedAt(),
                cardCount
        );
    }
}
