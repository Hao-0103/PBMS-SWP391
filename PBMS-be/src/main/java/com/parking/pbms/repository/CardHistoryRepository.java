package com.parking.pbms.repository;

import com.parking.pbms.model.CardHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CardHistoryRepository extends JpaRepository<CardHistory, Long> {

    @Query("SELECT ch, c.cardNo, cg.groupName, v.plateNo, cu.fullName, a.username " +
           "FROM CardHistory ch " +
           "LEFT JOIN Card c ON ch.cardId = c.cardId " +
           "LEFT JOIN CardGroup cg ON c.cardGroupId = cg.cardGroupId " +
           "LEFT JOIN Vehicle v ON c.vehicleId = v.vehicleId " +
           "LEFT JOIN Customer cu ON c.customerId = cu.customerId " +
           "LEFT JOIN Account a ON ch.performedBy = a.accountId " +
           "ORDER BY ch.actionAt DESC")
    List<Object[]> findAllHistoryDetails();
}
