package com.parking.pbms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "WorkShifts", schema = "dbo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ShiftID")
    private Integer shiftId;

    @Column(name = "ShiftCode", nullable = false, unique = true, length = 10)
    private String shiftCode;

    @Column(name = "ShiftName", nullable = false, length = 50)
    private String shiftName;

    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;

    @Column(name = "Status", nullable = false, length = 20)
    private String status;
}
