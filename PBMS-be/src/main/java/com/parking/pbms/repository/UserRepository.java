package com.parking.pbms.repository;

import com.parking.pbms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByAccountId(Integer accountId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE dbo.Customers SET FullName = :fullName, Email = :email, Phone = :phone, Address = :address, UpdatedAt = SYSDATETIME() WHERE AccountID = :accountId", nativeQuery = true)
    int updateCustomerProfile(
            @Param("accountId") Integer accountId,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("phone") String phone,
            @Param("address") String address
    );
}
