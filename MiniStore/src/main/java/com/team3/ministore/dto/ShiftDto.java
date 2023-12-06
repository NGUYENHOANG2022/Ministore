package com.team3.ministore.dto;

import com.team3.ministore.model.Shift;
import com.team3.ministore.utils.Role;
import lombok.Data;

import java.sql.Time;
import java.time.LocalDate;

@Data
public class ShiftDto {

    private int shiftId;

    private LocalDate date;

    private Boolean published;

    private int staffId;

    private Role role;

    private Float salaryCoefficient;

    private String name;

    private Time startTime;

    private Time endTime;

    private TimesheetDto timesheet;

    private ShiftCoverDto shiftCoverRequest;

    private StaffDto staff;

    public ShiftDto(Shift shift) {
        this.shiftId = shift.getShiftId();
        this.date = shift.getDate();
        this.published = shift.getPublished();
        this.role = shift.getRole();
        this.salaryCoefficient = shift.getSalaryCoefficient();
        this.name = shift.getName();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.staffId = shift.getStaff().getStaffId();
        if (shift.getTimesheet() != null)
            this.timesheet = new TimesheetDto(shift.getTimesheet());
        if (shift.getShiftCoverRequest() != null)
            this.shiftCoverRequest = new ShiftCoverDto(shift.getShiftCoverRequest(), false, false);
    }

    public ShiftDto(Shift shift, boolean withShiftCoverRequest) {
        this.shiftId = shift.getShiftId();
        this.date = shift.getDate();
        this.published = shift.getPublished();
        this.role = shift.getRole();
        this.salaryCoefficient = shift.getSalaryCoefficient();
        this.name = shift.getName();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.staffId = shift.getStaff().getStaffId();
        if (shift.getTimesheet() != null)
            this.timesheet = new TimesheetDto(shift.getTimesheet());
        if (withShiftCoverRequest && shift.getShiftCoverRequest() != null)
            this.shiftCoverRequest = new ShiftCoverDto(shift.getShiftCoverRequest());
    }

    public ShiftDto(Shift shift, boolean withStaff, boolean withShiftCoverRequest) {
        this.shiftId = shift.getShiftId();
        this.date = shift.getDate();
        this.published = shift.getPublished();
        this.role = shift.getRole();
        this.salaryCoefficient = shift.getSalaryCoefficient();
        this.name = shift.getName();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.staffId = shift.getStaff().getStaffId();
        if (shift.getTimesheet() != null)
            this.timesheet = new TimesheetDto(shift.getTimesheet());
        if (withShiftCoverRequest && shift.getShiftCoverRequest() != null)
            this.shiftCoverRequest = new ShiftCoverDto(shift.getShiftCoverRequest());
        if (withStaff)
            this.staff = new StaffDto(shift.getStaff());
    }

    public ShiftDto(Shift shift, boolean withStaff, boolean withTimesheet, boolean withShiftCoverRequest) {
        this.shiftId = shift.getShiftId();
        this.date = shift.getDate();
        this.published = shift.getPublished();
        this.role = shift.getRole();
        this.salaryCoefficient = shift.getSalaryCoefficient();
        this.name = shift.getName();
        this.startTime = shift.getStartTime();
        this.endTime = shift.getEndTime();
        this.staffId = shift.getStaff().getStaffId();
        if (withTimesheet && shift.getTimesheet() != null)
            this.timesheet = new TimesheetDto(shift.getTimesheet());
        if (withShiftCoverRequest && shift.getShiftCoverRequest() != null)
            this.shiftCoverRequest = new ShiftCoverDto(shift.getShiftCoverRequest());
        if (withStaff)
            this.staff = new StaffDto(shift.getStaff());
    }

}
