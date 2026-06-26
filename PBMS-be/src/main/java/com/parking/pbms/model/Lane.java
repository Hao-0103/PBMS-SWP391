package com.parking.pbms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Lanes", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lane {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LaneID")
    private Integer laneId;

    @Column(name = "LaneCode", nullable = false, unique = true, length = 20)
    private String laneCode;

    @Column(name = "LaneName", nullable = false, length = 100)
    private String laneName;

    @Column(name = "LaneType", nullable = false, length = 10)
    private String laneType;

    @Column(name = "VehicleType", nullable = false, length = 20)
    private String vehicleType;

    @Column(name = "AreaName", length = 100)
    private String areaName;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;
}
