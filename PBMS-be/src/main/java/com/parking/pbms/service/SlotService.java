package com.parking.pbms.service;

import com.parking.pbms.dto.SlotResponse;
import com.parking.pbms.dto.SlotStatsResponse;
import com.parking.pbms.dto.UpdateSlotStatusRequest;
import com.parking.pbms.model.ParkingZone;
import java.util.List;

public interface SlotService {
    List<SlotResponse> getAllSlots(Integer floorId, Integer zoneId, String status);
    List<ParkingZone> getZonesByFloor(Integer floorId);
    SlotResponse updateSlotStatus(Integer slotId, UpdateSlotStatusRequest request);
    SlotStatsResponse getSlotStatistics(String date);
}
