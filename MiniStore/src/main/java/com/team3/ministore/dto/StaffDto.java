package com.team3.ministore.dto;

import com.team3.ministore.model.Staff;
import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDto {
    private int staffId;
    private String username;
    private String staffName;
    private String email;
    private Role role;
    private StaffStatus status;
    private String image;
    private String phoneNumber;
    private String workDays;
    private Integer leaveBalance;
    private SalaryDto salary;
    private List<LeaveRequestDto> leaveRequests;
    private List<ShiftDto> shifts;

    public StaffDto(Staff staff) {
        this.staffId = staff.getStaffId();
        this.username = staff.getUsername();
        this.staffName = staff.getStaffName();
        this.email = staff.getEmail();
        this.role = staff.getRole();
        this.status = staff.getStatus();
        this.image = staff.getImage();
        this.phoneNumber = staff.getPhoneNumber();
        this.workDays = staff.getWorkDays();
        this.leaveBalance = staff.getLeaveBalance();
        this.leaveRequests = new ArrayList<>();
        this.shifts = new ArrayList<>();
    }

    public StaffDto(Staff staff, SalaryDto salary) {
        this.staffId = staff.getStaffId();
        this.username = staff.getUsername();
        this.staffName = staff.getStaffName();
        this.email = staff.getEmail();
        this.role = staff.getRole();
        this.status = staff.getStatus();
        this.image = staff.getImage();
        this.phoneNumber = staff.getPhoneNumber();
        this.workDays = staff.getWorkDays();
        this.leaveBalance = staff.getLeaveBalance();
        this.salary = salary;
        this.leaveRequests = new ArrayList<>();
        this.shifts = new ArrayList<>();
    }

    public StaffDto(Staff staff, List<ShiftDto> shifts, List<LeaveRequestDto> leaveRequests) {
        this.staffId = staff.getStaffId();
        this.username = staff.getUsername();
        this.staffName = staff.getStaffName();
        this.email = staff.getEmail();
        this.role = staff.getRole();
        this.status = staff.getStatus();
        this.image = staff.getImage();
        this.phoneNumber = staff.getPhoneNumber();
        this.workDays = staff.getWorkDays();
        this.leaveBalance = staff.getLeaveBalance();
        this.shifts = shifts;
        this.leaveRequests = leaveRequests;
    }

    public StaffDto(Staff staff, SalaryDto salary, List<ShiftDto> shifts, List<LeaveRequestDto> leaveRequests) {
        this.staffId = staff.getStaffId();
        this.username = staff.getUsername();
        this.staffName = staff.getStaffName();
        this.email = staff.getEmail();
        this.role = staff.getRole();
        this.status = staff.getStatus();
        this.image = staff.getImage();
        this.phoneNumber = staff.getPhoneNumber();
        this.workDays = staff.getWorkDays();
        this.leaveBalance = staff.getLeaveBalance();
        this.salary = salary;
        this.shifts = shifts;
        this.leaveRequests = leaveRequests;
    }

}
