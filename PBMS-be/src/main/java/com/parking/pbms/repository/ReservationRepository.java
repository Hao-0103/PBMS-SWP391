package com.parking.pbms.repository;

import com.parking.pbms.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByReservationNo(String reservationNo);
}
