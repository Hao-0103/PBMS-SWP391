package com.parking.pbms.repository;

import com.parking.pbms.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Integer> {
    
    @Query("SELECT c FROM Card c JOIN CardGroup cg ON c.cardGroupId = cg.cardGroupId WHERE c.customerId = :customerId AND cg.ticketType IN ('MONTHLY', 'DAY')")
    List<Card> findMonthlyAndDayCardsByCustomerId(@Param("customerId") Integer customerId);

    boolean existsByRfidUid(String rfidUid);

    Optional<Card> findByCardNo(String cardNo);
    Optional<Card> findByRfidUid(String rfidUid);
}

