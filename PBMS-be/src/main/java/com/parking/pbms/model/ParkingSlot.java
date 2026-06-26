package com.parking.pbms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ParkingSlots", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SlotID")
    private Integer slotId;

    @Column(name = "SlotCode", nullable = false, unique = true, length = 20)
    private String slotCode;

    @Column(name = "FloorID", nullable = false)
    private Integer floorId;

    @Column(name = "ZoneID", nullable = false)
    private Integer zoneId;

    @Column(name = "SlotNumber", nullable = false)
    private Integer slotNumber;

    @Column(name = "VehicleType", nullable = false, length = 20)
    private String vehicleType;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;

    @Column(name = "DisabledReason", length = 500)
    private String disabledReason;

    @Column(name = "LastUpdatedAt", nullable = false)
    private LocalDateTime lastUpdatedAt;
}
