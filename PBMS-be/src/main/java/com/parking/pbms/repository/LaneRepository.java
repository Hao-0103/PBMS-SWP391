package com.parking.pbms.repository;

import com.parking.pbms.model.Lane;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LaneRepository extends JpaRepository<Lane, Integer> {
    Optional<Lane> findByLaneCode(String laneCode);
    List<Lane> findByStatus(String status);
}
