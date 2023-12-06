package com.team3.ministore.dto;

import com.team3.ministore.model.Timesheet;
import com.team3.ministore.utils.TimesheetStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.sql.Time;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetDto {
    private int timesheetId;

    @NotNull(message = "Shift ID is required")
    private int shiftId;

    @NotNull(message = "Staff ID is required")
    private int staffId;

    private int salaryId;

    @NotNull(message = "Check in time is required")
    private Time checkInTime;

    private Time checkOutTime;

    private TimesheetStatus status;

    private String noteTitle;

    private String noteContent;

    private ShiftDto shift;

    private StaffDto staff;

    private SalaryDto salary;


    public TimesheetDto(Timesheet timesheet) {
        this.timesheetId = timesheet.getTimesheetId();
        this.shiftId = timesheet.getShift().getShiftId();
        this.staffId = timesheet.getStaff().getStaffId();
        if (timesheet.getSalary() != null)
            this.salaryId = timesheet.getSalary().getSalaryId();
        this.checkInTime = timesheet.getCheckInTime();
        this.checkOutTime = timesheet.getCheckOutTime();
        this.status = timesheet.getStatus();
        this.noteTitle = timesheet.getNoteTitle();
        this.noteContent = timesheet.getNoteContent();
    }

    public TimesheetDto(Timesheet timesheet, boolean withShift, boolean withStaff, boolean withSalary) {
        this.timesheetId = timesheet.getTimesheetId();
        this.shiftId = timesheet.getShift().getShiftId();
        this.staffId = timesheet.getStaff().getStaffId();
        if (timesheet.getSalary() != null)
            this.salaryId = timesheet.getSalary().getSalaryId();
        this.checkInTime = timesheet.getCheckInTime();
        this.checkOutTime = timesheet.getCheckOutTime();
        this.status = timesheet.getStatus();
        this.noteTitle = timesheet.getNoteTitle();
        this.noteContent = timesheet.getNoteContent();
        if (withSalary && timesheet.getSalary() != null)
            this.salary = new SalaryDto(timesheet.getSalary());
        if (withStaff)
            this.staff = new StaffDto(timesheet.getStaff());
        if (withShift)
            this.shift = new ShiftDto(timesheet.getShift(), false, false, false);
    }
}
