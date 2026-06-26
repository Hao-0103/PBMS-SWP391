package com.parking.pbms.service.impl;

import com.parking.pbms.dto.CreateAssignmentRequest;
import com.parking.pbms.dto.ReassignStaffRequest;
import com.parking.pbms.dto.StaffAssignmentResponse;
import com.parking.pbms.model.*;
import com.parking.pbms.repository.*;
import com.parking.pbms.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService {

    private final StaffAssignmentRepository staffAssignmentRepository;
    private final WorkShiftRepository workShiftRepository;
    private final FloorRepository floorRepository;
    private final LaneRepository laneRepository;
    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final AdminRepository adminRepository;

    @Override
    public List<StaffAssignmentResponse> getAssignments(String dateString) {
        LocalDate date;
        if (dateString != null && !dateString.trim().isEmpty()) {
            try {
                date = LocalDate.parse(dateString.trim());
            } catch (Exception e) {
                date = LocalDate.now();
            }
        } else {
            date = LocalDate.now();
        }

        List<StaffAssignment> assignments = staffAssignmentRepository.findByWorkDate(date);
        return assignments.stream().map(this::mapToResponse).toList();
    }

    @Override
    @Transactional
    public StaffAssignmentResponse createAssignment(CreateAssignmentRequest request, String adminUsername) {
        // Find admin
        Account adminAccount = accountRepository.findByUsernameIgnoreCase(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản admin: " + adminUsername));
        Admin admin = adminRepository.findByAccountId(adminAccount.getAccountId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ admin tương ứng"));

        // Validate floor & lane existence
        Floor floor = floorRepository.findById(request.floorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tầng: " + request.floorId()));
        Lane lane = laneRepository.findById(request.laneId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy làn xe: " + request.laneId()));
        WorkShift shift = workShiftRepository.findById(request.shiftId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca trực: " + request.shiftId()));
        Staff staff = staffRepository.findById(request.staffId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + request.staffId()));

        // Check if staff account is active
        Account staffAccount = accountRepository.findById(staff.getAccountId()).orElse(null);
        if (staffAccount != null && !staffAccount.getStatus().equalsIgnoreCase("ACTIVE")) {
            throw new RuntimeException("Tài khoản của nhân viên này hiện không hoạt động (Trạng thái: " + staffAccount.getStatus() + ")");
        }

        // Check conflicts: Lane already assigned in this shift
        Optional<StaffAssignment> laneConflict = staffAssignmentRepository
                .findFirstByLaneIdAndWorkDateAndShiftIdAndStatusNot(request.laneId(), request.workDate(), request.shiftId(), "CANCELLED");
        if (laneConflict.isPresent()) {
            throw new RuntimeException("Vị trí/Làn xe này đã có nhân viên phụ trách trong ca này.");
        }

        // Check conflicts: Staff already assigned to another position in this shift
        Optional<StaffAssignment> staffConflict = staffAssignmentRepository
                .findFirstByStaffIdAndWorkDateAndShiftIdAndStatusNot(request.staffId(), request.workDate(), request.shiftId(), "CANCELLED");
        if (staffConflict.isPresent()) {
            throw new RuntimeException("Nhân viên này đã được phân công trực ở vị trí khác trong cùng ca này.");
        }

        StaffAssignment assignment = StaffAssignment.builder()
                .workDate(request.workDate())
                .shiftId(request.shiftId())
                .laneId(request.laneId())
                .floorId(request.floorId())
                .staffId(request.staffId())
                .status("ASSIGNED")
                .note(request.note())
                .assignedBy(admin.getAdminId())
                .assignedAt(LocalDateTime.now())
                .build();

        StaffAssignment saved = staffAssignmentRepository.saveAndFlush(assignment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public StaffAssignmentResponse reassignStaff(Long id, ReassignStaffRequest request) {
        StaffAssignment assignment = staffAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân công với ID: " + id));

        if (assignment.getStatus().equalsIgnoreCase("CANCELLED") || assignment.getStatus().equalsIgnoreCase("COMPLETED")) {
            throw new RuntimeException("Không thể đổi ca cho phân công đã hủy hoặc đã kết thúc");
        }

        Staff staff = staffRepository.findById(request.staffId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên thay thế: " + request.staffId()));

        // Check conflicts for the new staff
        Optional<StaffAssignment> staffConflict = staffAssignmentRepository
                .findFirstByStaffIdAndWorkDateAndShiftIdAndStatusNot(request.staffId(), assignment.getWorkDate(), assignment.getShiftId(), "CANCELLED");
        if (staffConflict.isPresent() && !staffConflict.get().getAssignmentId().equals(id)) {
            throw new RuntimeException("Nhân viên thay thế đã được phân công vị trí khác trong cùng ca trực này.");
        }

        assignment.setStaffId(request.staffId());
        assignment.setNote(request.note());
        
        // If it was ASSIGNED, keep it or check if we update status
        StaffAssignment saved = staffAssignmentRepository.saveAndFlush(assignment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public StaffAssignmentResponse cancelAssignment(Long id) {
        StaffAssignment assignment = staffAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân công với ID: " + id));

        assignment.setStatus("CANCELLED");
        StaffAssignment saved = staffAssignmentRepository.saveAndFlush(assignment);
        return mapToResponse(saved);
    }

    @Override
    public List<Staff> getActiveStaffList() {
        return staffRepository.findAll().stream()
                .filter(s -> s.getStatus().equalsIgnoreCase("ACTIVE"))
                .toList();
    }

    @Override
    public List<WorkShift> getShifts() {
        return workShiftRepository.findAll().stream()
                .filter(w -> w.getStatus().equalsIgnoreCase("ACTIVE"))
                .toList();
    }

    @Override
    public StaffAssignmentResponse getActiveAssignmentForStaff(String staffUsername) {
        Account staffAccount = accountRepository.findByUsernameIgnoreCase(staffUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản nhân viên: " + staffUsername));
        Staff staff = staffRepository.findByAccountId(staffAccount.getAccountId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ nhân viên"));

        Optional<StaffAssignment> activeAssignment = staffAssignmentRepository
                .findFirstByStaffIdAndWorkDateAndStatusNot(staff.getStaffId(), LocalDate.now(), "CANCELLED");

        return activeAssignment.map(this::mapToResponse).orElse(null);
    }

    private StaffAssignmentResponse mapToResponse(StaffAssignment assignment) {
        WorkShift shift = workShiftRepository.findById(assignment.getShiftId()).orElse(null);
        Lane lane = laneRepository.findById(assignment.getLaneId()).orElse(null);
        Floor floor = floorRepository.findById(assignment.getFloorId()).orElse(null);
        
        String staffCode = "";
        String staffName = "";
        if (assignment.getStaffId() != null) {
            Staff staff = staffRepository.findById(assignment.getStaffId()).orElse(null);
            if (staff != null) {
                staffCode = staff.getStaffCode();
                staffName = staff.getFullName();
            }
        }

        String shiftTime = "";
        if (shift != null) {
            shiftTime = shift.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")) + " – " +
                        shift.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        }

        return new StaffAssignmentResponse(
                assignment.getAssignmentId(),
                assignment.getWorkDate(),
                assignment.getShiftId(),
                shift != null ? shift.getShiftCode() : "",
                shift != null ? shift.getShiftName() : "",
                shiftTime,
                assignment.getLaneId(),
                lane != null ? lane.getLaneCode() : "",
                lane != null ? lane.getLaneName() : "",
                lane != null ? lane.getLaneType() : "",
                assignment.getFloorId(),
                floor != null ? floor.getFloorCode() : "",
                floor != null ? floor.getFloorName() : "",
                assignment.getStaffId(),
                staffCode,
                staffName,
                assignment.getStatus(),
                assignment.getNote(),
                assignment.getAssignedAt()
        );
    }
}
