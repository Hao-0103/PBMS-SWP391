package com.parking.pbms.service.impl;

import com.parking.pbms.dto.VehicleDto;
import com.parking.pbms.dto.VehicleRequest;
import com.parking.pbms.model.Account;
import com.parking.pbms.model.Vehicle;
import com.parking.pbms.repository.AccountRepository;
import com.parking.pbms.repository.VehicleRepository;
import com.parking.pbms.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VehicleDto> getMyVehicles(String username) {
        Account account = resolveAccount(username);
        return vehicleRepository
                .findByAccountIdAndStatus(account.getAccountId(), "ACTIVE")
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public VehicleDto addVehicle(String username, VehicleRequest request) {
        Account account = resolveAccount(username);
        String plateNo = request.plateNo().trim().toUpperCase();

        if (vehicleRepository.findByPlateNo(plateNo).isPresent()) {
            throw new RuntimeException("Biển số " + plateNo + " đã tồn tại trong hệ thống!");
        }

        Vehicle vehicle = Vehicle.builder()
                .accountId(account.getAccountId())
                .plateNo(plateNo)
                .vehicleType(request.vehicleType().trim().toUpperCase())
                .brand(request.brand())
                .model(request.model())
                .color(request.color())
                .status("ACTIVE")
                .build();

        return toDto(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public VehicleDto updateVehicle(String username, Integer vehicleId, VehicleRequest request) {
        Account account = resolveAccount(username);
        Vehicle vehicle = vehicleRepository
                .findByVehicleIdAndAccountId(vehicleId, account.getAccountId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy phương tiện hoặc bạn không có quyền sửa phương tiện này"));

        String newPlate = request.plateNo().trim().toUpperCase();
        if (!newPlate.equals(vehicle.getPlateNo())) {
            if (vehicleRepository.findByPlateNo(newPlate).isPresent()) {
                throw new RuntimeException("Biển số " + newPlate + " đã tồn tại trong hệ thống!");
            }
            vehicle.setPlateNo(newPlate);
        }

        vehicle.setVehicleType(request.vehicleType().trim().toUpperCase());
        vehicle.setBrand(request.brand());
        vehicle.setModel(request.model());
        vehicle.setColor(request.color());

        return toDto(vehicleRepository.save(vehicle));
    }

    @Override
    @Transactional
    public void deleteVehicle(String username, Integer vehicleId) {
        Account account = resolveAccount(username);
        Vehicle vehicle = vehicleRepository
                .findByVehicleIdAndAccountId(vehicleId, account.getAccountId())
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy phương tiện hoặc bạn không có quyền xóa phương tiện này"));

        vehicle.setStatus("INACTIVE");
        vehicleRepository.save(vehicle);
    }

    // ── Helpers ───────────────────────────────────────────────────────
    private Account resolveAccount(String username) {
        return accountRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + username));
    }

    private VehicleDto toDto(Vehicle v) {
        return new VehicleDto(v.getVehicleId(), v.getPlateNo(), v.getVehicleType(),
                v.getBrand(), v.getModel(), v.getColor());
    }
}
