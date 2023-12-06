package com.team3.ministore.dto;

import com.team3.ministore.model.LeaveRequest;
import com.team3.ministore.utils.LeaveStatus;
import com.team3.ministore.utils.LeaveType;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@RequiredArgsConstructor
public class LeaveRequestDto {
    private int leaveRequestId;

    @NotNull(message = "Leave type must not be null")
    private LeaveType leaveType;

    @NotNull(message = "Start date must not be null")
    private LocalDate startDate;

    @NotNull(message = "End date must not be null")
    private LocalDate endDate;

    @NotNull(message = "Status type must not be null")
    private LeaveStatus status;

    @NotNull(message = "Reason must not be null")
    private String reason;

    @NotNull(message = "Reply must not be null")
    private String adminReply;

    @NotNull(message = "Staff must not be null")
    private int staffId;

    private StaffDto staff;

    public LeaveRequestDto(LeaveRequest leave) {
        this.leaveType = leave.getLeaveType();
        this.startDate = leave.getStartDate();
        this.endDate = leave.getEndDate();
        this.status = leave.getStatus();
        this.reason = leave.getReason();
        this.adminReply = leave.getAdminReply();
        this.leaveRequestId = leave.getLeaveRequestId();
        this.staffId = leave.getStaff().getStaffId();
        this.staff = new StaffDto(leave.getStaff());
    }

    public LeaveRequestDto(LeaveRequest leave, boolean getStaff) {
        this.leaveType = leave.getLeaveType();
        this.startDate = leave.getStartDate();
        this.endDate = leave.getEndDate();
        this.status = leave.getStatus();
        this.reason = leave.getReason();
        this.adminReply = leave.getAdminReply();
        this.leaveRequestId = leave.getLeaveRequestId();
        this.staffId = leave.getStaff().getStaffId();
        if (getStaff) {
            this.staff = new StaffDto(leave.getStaff());
        }
    }

}
