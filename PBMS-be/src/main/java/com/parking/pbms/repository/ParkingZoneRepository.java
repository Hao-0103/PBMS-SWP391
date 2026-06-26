package com.parking.pbms.repository;

import com.parking.pbms.model.ParkingZone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParkingZoneRepository extends JpaRepository<ParkingZone, Integer> {
    List<ParkingZone> findByFloorId(Integer floorId);
}
