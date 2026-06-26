package com.parking.pbms.repository;

import com.parking.pbms.model.CardGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CardGroupRepository extends JpaRepository<CardGroup, Integer> {
    Optional<CardGroup> findByGroupName(String groupName);
}
