package com.parking.pbms.repository;

import com.parking.pbms.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Integer> {
    List<ParkingSlot> findByFloorId(Integer floorId);
    List<ParkingSlot> findByZoneId(Integer zoneId);
    List<ParkingSlot> findByFloorIdAndZoneId(Integer floorId, Integer zoneId);
    
    long countByFloorIdAndVehicleType(Integer floorId, String vehicleType);
    long countByFloorIdAndVehicleTypeAndStatus(Integer floorId, String vehicleType, String status);
}
