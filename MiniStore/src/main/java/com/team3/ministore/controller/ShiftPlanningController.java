package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.*;
import com.team3.ministore.model.Shift;
import com.team3.ministore.model.Staff;
import com.team3.ministore.service.*;
import com.team3.ministore.utils.LeaveStatus;
import com.team3.ministore.utils.ShiftCoverStatus;
import com.team3.ministore.utils.StaffStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/shift-planning")
public class ShiftPlanningController {
    @Autowired
    private ShiftService shiftService;
    @Autowired
    private StaffService staffService;
    @Autowired
    private SalaryService salaryService;
    @Autowired
    private LeaveRequestService leaveRequestService;
    @Autowired
    private ShiftCoverRequestService shiftCoverRequestService;

    @GetMapping()
    public ResponseEntity<Object> getShiftPlanning(@RequestParam(value = "from", required = false) String from,
                                                   @RequestParam(value = "to", required = false) String to,
                                                   @RequestParam(value = "staffId", required = false) Integer staffId) {
        if (from == null || to == null)
            return ResponseHandler.getResponse(new Exception("Invalid input"), HttpStatus.BAD_REQUEST);

        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);

        if (fromDate.isAfter(toDate))
            return ResponseHandler.getResponse(new Exception("Invalid input"), HttpStatus.BAD_REQUEST);

        // Get all staffs if staffId is not specified
        if (staffId == null) {
            // Get all staffs in the database
            List<Staff> staffs = staffService.getAllStaffs();
            // Iterate through all staffs and get their shifts and salary
            List<StaffDto> staffDtos = staffs.parallelStream()
                    .filter(staff -> staff.getStatus() == StaffStatus.ACTIVE).map(staff -> {
                        // Get the salary and leave requests of the staff
                        SalaryDto salaryDto = salaryService.getSalaryByStaffId(staff.getStaffId());
                        List<LeaveRequestDto> leaveRequestDtos = leaveRequestService
                                .getLeaveRequestsByStaffIdAndDates(staff.getStaffId(), fromDate, toDate)
                                .stream().filter(leaveRequestDto -> leaveRequestDto.getStatus().equals(LeaveStatus.APPROVED))
                                .collect(Collectors.toList());
                        // Get the shifts of the staff
                        List<Shift> shifts = shiftService.getAllShiftsByStaffId(staff.getStaffId(), fromDate, toDate);

                        // Filter out the shifts that are in the leave requests
                        shifts = shifts.stream().filter(shift -> {
                            for (LeaveRequestDto leaveRequestDto : leaveRequestDtos) {
                                if (leaveRequestDto.getStartDate().isEqual(shift.getDate())
                                        || leaveRequestDto.getEndDate().isEqual(shift.getDate())
                                        || (leaveRequestDto.getStartDate().isBefore(shift.getDate())
                                        && leaveRequestDto.getEndDate().isAfter(shift.getDate())))
                                    return false;
                            }
                            return true;
                        }).collect(Collectors.toList());

                        // Convert shifts to shiftDtos
                        List<ShiftDto> shiftDtos = shifts.stream().map(ShiftDto::new).collect(Collectors.toList());

                        // Return the staffDtos
                        return new StaffDto(staff, salaryDto, shiftDtos, leaveRequestDtos);
                    }).collect(Collectors.toList());

            // Return all staffs
            return ResponseHandler.getResponse(staffDtos, HttpStatus.OK);
        }

        // ------------------------------------------------------------
        // If staffId is specified, return the staff with the given staffId
        // This is for the staff to view their own shift planning
        // ------------------------------------------------------------
        Optional<Staff> foundStaff = staffService.getStaffById(staffId);

        if (foundStaff.isEmpty() || foundStaff.get().getStatus() == StaffStatus.DISABLED)
            return ResponseHandler.getResponse(new Exception("Staff not found"), HttpStatus.NOT_FOUND);

        SalaryDto salaryDto = salaryService.getSalaryByStaffId(foundStaff.get().getStaffId());
        List<LeaveRequestDto> leaveRequestDtos = leaveRequestService
                .getLeaveRequestsByStaffIdAndDates(foundStaff.get().getStaffId(), fromDate, toDate)
                .stream().filter(leaveRequestDto -> leaveRequestDto.getStatus().equals(LeaveStatus.APPROVED))
                .collect(Collectors.toList());
        // Get the shifts of the staff
        List<Shift> shifts = shiftService.getAllShiftsByStaffId(foundStaff.get().getStaffId(), fromDate, toDate);

        List<ShiftDto> shiftDtos = shifts.stream()
                // Filter out the shifts which are covered by other staffs
                .filter(s -> s.getShiftCoverRequest() == null || s.getShiftCoverRequest().getStatus() != ShiftCoverStatus.APPROVED)
                // Filter out the shifts that are in the leave requests
                .filter(shift -> {
                    for (LeaveRequestDto leaveRequestDto : leaveRequestDtos) {
                        if (leaveRequestDto.getStartDate().isEqual(shift.getDate())
                                || leaveRequestDto.getEndDate().isEqual(shift.getDate())
                                || (leaveRequestDto.getStartDate().isBefore(shift.getDate()) && leaveRequestDto.getEndDate().isAfter(shift.getDate())))
                            return false;
                    }
                    return true;
                })
                // Convert shifts to shiftDtos
                .map(ShiftDto::new).collect(Collectors.toList());

        // Get the shifts of others which are covered by the staff
        List<ShiftCoverDto> shiftCoverDtos = shiftCoverRequestService
                .getShiftCoverRequestsByStaffIdAndDates(foundStaff.get().getStaffId(), fromDate, toDate)
                .stream().filter(s -> s.getStatus() == ShiftCoverStatus.APPROVED).collect(Collectors.toList());

        // Add the shifts which are covered by the staff to the shiftDtos
        shiftCoverDtos.stream().map(ShiftCoverDto::getShift)
                .forEach(shift -> {
                    if (shiftDtos.stream().noneMatch(shift1 -> shift1.getShiftId() == shift.getShiftId()))
                        shiftDtos.add(shift);
                });

        // Filter the shifts which are not published
        List<ShiftDto> lShifts = shiftDtos.stream().filter(ShiftDto::getPublished).collect(Collectors.toList());

        // Return the staffDtos
        return ResponseHandler.getResponse(List.of(new StaffDto(foundStaff.get(), salaryDto, lShifts, leaveRequestDtos)), HttpStatus.OK);
    }
}
