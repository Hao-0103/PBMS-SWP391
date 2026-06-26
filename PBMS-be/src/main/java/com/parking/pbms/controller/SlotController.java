package com.parking.pbms.controller;

import com.parking.pbms.dto.ApiResponse;
import com.parking.pbms.dto.SlotResponse;
import com.parking.pbms.dto.SlotStatsResponse;
import com.parking.pbms.dto.UpdateSlotStatusRequest;
import com.parking.pbms.model.ParkingZone;
import com.parking.pbms.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<SlotStatsResponse>> getSlotStatistics(
            @RequestParam(value = "date", required = false) String date
    ) {
        SlotStatsResponse stats = slotService.getSlotStatistics(date);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy thống kê slot đỗ xe thành công", stats)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getAllSlots(
            @RequestParam(value = "floorId", required = false) Integer floorId,
            @RequestParam(value = "zoneId", required = false) Integer zoneId,
            @RequestParam(value = "status", required = false) String status
    ) {
        List<SlotResponse> slots = slotService.getAllSlots(floorId, zoneId, status);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy danh sách slot đỗ xe thành công", slots)
        );
    }

    @GetMapping("/zones")
    public ResponseEntity<ApiResponse<List<ParkingZone>>> getZones(
            @RequestParam(value = "floorId", required = false) Integer floorId
    ) {
        List<ParkingZone> zones = slotService.getZonesByFloor(floorId);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Lấy danh sách zone đỗ xe thành công", zones)
        );
    }

    @PutMapping("/{slotId}/status")
    public ResponseEntity<ApiResponse<SlotResponse>> updateSlotStatus(
            @PathVariable("slotId") Integer slotId,
            @Valid @RequestBody UpdateSlotStatusRequest request
    ) {
        SlotResponse response = slotService.updateSlotStatus(slotId, request);
        return ResponseEntity.ok(
                ApiResponse.success(200, "Cập nhật trạng thái slot thành công", response)
        );
    }
}
