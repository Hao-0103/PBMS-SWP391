package com.parking.pbms.service.impl;

import com.parking.pbms.dto.FloorStatDto;
import com.parking.pbms.dto.SlotStatsResponse;
import com.parking.pbms.model.Floor;
import com.parking.pbms.repository.FloorRepository;
import com.parking.pbms.repository.ParkingSessionRepository;
import com.parking.pbms.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotServiceImpl implements SlotService {

    private final FloorRepository floorRepository;
    private final ParkingSessionRepository parkingSessionRepository;

    @Override
    public SlotStatsResponse getSlotStatistics(String dateStr) {
        LocalDate date;
        if (dateStr == null || dateStr.trim().isEmpty()) {
            date = LocalDate.now();
        } else {
            try {
                date = LocalDate.parse(dateStr);
            } catch (Exception e) {
                date = LocalDate.now();
            }
        }

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Floor> floors = floorRepository.findAll();
        List<FloorStatDto> floorStats = new ArrayList<>();

        int totalCarSlots = 0;
        int totalMotorcycleSlots = 0;
        int monthlyCarInside = 0;
        int monthlyMotorcycleInside = 0;

        for (Floor floor : floors) {
            if (!"ACTIVE".equalsIgnoreCase(floor.getStatus())) {
                continue;
            }

            int floorTotalCarSlots = floor.getTotalCarSlots() != null ? floor.getTotalCarSlots() : 0;
            int floorTotalMotorcycleSlots = floor.getTotalMotorcycleSlots() != null ? floor.getTotalMotorcycleSlots() : 0;

            int occupiedCar = (int) parkingSessionRepository.countActiveSessions(
                    floor.getFloorId(), "CAR", startOfDay, endOfDay);
            int occupiedMotorcycle = (int) parkingSessionRepository.countActiveSessions(
                    floor.getFloorId(), "MOTORCYCLE", startOfDay, endOfDay);

            int floorMonthlyCar = (int) parkingSessionRepository.countActiveMonthlySessions(
                    floor.getFloorId(), "CAR", startOfDay, endOfDay);
            int floorMonthlyMotorcycle = (int) parkingSessionRepository.countActiveMonthlySessions(
                    floor.getFloorId(), "MOTORCYCLE", startOfDay, endOfDay);

            int availableCar = Math.max(0, floorTotalCarSlots - occupiedCar);
            int availableMotorcycle = Math.max(0, floorTotalMotorcycleSlots - occupiedMotorcycle);

            FloorStatDto dto = new FloorStatDto(
                    floor.getFloorId(),
                    floor.getFloorCode(),
                    floor.getFloorName(),
                    floorTotalCarSlots,
                    availableCar,
                    occupiedCar,
                    floorMonthlyCar,
                    floorTotalMotorcycleSlots,
                    availableMotorcycle,
                    occupiedMotorcycle,
                    floorMonthlyMotorcycle
            );

            floorStats.add(dto);

            totalCarSlots += floorTotalCarSlots;
            totalMotorcycleSlots += floorTotalMotorcycleSlots;
            monthlyCarInside += floorMonthlyCar;
            monthlyMotorcycleInside += floorMonthlyMotorcycle;
        }

        return new SlotStatsResponse(
                totalCarSlots,
                totalMotorcycleSlots,
                monthlyCarInside,
                monthlyMotorcycleInside,
                floorStats
        );
    }
}
