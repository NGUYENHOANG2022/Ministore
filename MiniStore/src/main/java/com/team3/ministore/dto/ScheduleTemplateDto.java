package com.team3.ministore.dto;

import com.team3.ministore.model.ScheduleTemplate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleTemplateDto {
    private int scheduleTemplateId;

    @NotNull(message = "Name must not be null")
    private String name;

    private String description;

    private int numOfShifts;

    private List<ScheduleShiftTemplateDto> scheduleShiftTemplates;

    public ScheduleTemplateDto(ScheduleTemplate scheduleTemplate) {
        this.scheduleTemplateId = scheduleTemplate.getScheduleTemplateId();
        this.name = scheduleTemplate.getName();
        this.description = scheduleTemplate.getDescription();
        this.numOfShifts = scheduleTemplate.getNumOfShifts();
        if (scheduleTemplate.getScheduleShiftTemplates() != null)
            this.scheduleShiftTemplates = scheduleTemplate.getScheduleShiftTemplates()
                    .stream().map(ScheduleShiftTemplateDto::new).collect(Collectors.toList());
    }

    public ScheduleTemplateDto(ScheduleTemplate scheduleTemplate, boolean withScheduleShiftTemplates) {
        this.scheduleTemplateId = scheduleTemplate.getScheduleTemplateId();
        this.name = scheduleTemplate.getName();
        this.description = scheduleTemplate.getDescription();
        this.numOfShifts = scheduleTemplate.getNumOfShifts();
        if (withScheduleShiftTemplates && scheduleTemplate.getScheduleShiftTemplates() != null)
            this.scheduleShiftTemplates = scheduleTemplate.getScheduleShiftTemplates()
                    .stream().map(ScheduleShiftTemplateDto::new).collect(Collectors.toList());
    }
}
