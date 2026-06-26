package com.parking.pbms.repository;

import com.parking.pbms.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    Optional<Vehicle> findByPlateNo(String plateNo);
}
