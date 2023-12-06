package com.team3.ministore.dto;

import com.team3.ministore.model.ScheduleShiftTemplate;
import com.team3.ministore.utils.Role;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ScheduleShiftTemplateDto {

    private int scheduleShiftTemplateId;

    private LocalDate date;

    private Time startTime;

    private Time endTime;

    private String name;

    private Role role;

    private Float salaryCoefficient;

    private int scheduleTemplateId;

    private int staffId;

    private String staffName;

    public ScheduleShiftTemplateDto(ScheduleShiftTemplate scheduleShiftTemplate) {
        this.scheduleShiftTemplateId = scheduleShiftTemplate.getScheduleShiftTemplateId();
        this.date = scheduleShiftTemplate.getDate();
        this.startTime = scheduleShiftTemplate.getStartTime();
        this.endTime = scheduleShiftTemplate.getEndTime();
        this.name = scheduleShiftTemplate.getName();
        this.role = scheduleShiftTemplate.getRole();
        this.salaryCoefficient = scheduleShiftTemplate.getSalaryCoefficient();
        this.scheduleTemplateId = scheduleShiftTemplate.getScheduleTemplate().getScheduleTemplateId();
        this.staffId = scheduleShiftTemplate.getStaff().getStaffId();
        this.staffName = scheduleShiftTemplate.getStaff().getStaffName();
    }
}
