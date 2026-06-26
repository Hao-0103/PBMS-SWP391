package com.parking.pbms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ParkingZones", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ZoneID")
    private Integer zoneId;

    @Column(name = "FloorID", nullable = false)
    private Integer floorId;

    @Column(name = "ZoneCode", nullable = false, length = 10)
    private String zoneCode;

    @Column(name = "ZoneName", length = 100)
    private String zoneName;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;
}
