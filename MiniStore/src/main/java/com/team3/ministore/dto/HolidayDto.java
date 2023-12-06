package com.team3.ministore.dto;

import com.team3.ministore.model.Holiday;
import lombok.AllArgsConstructor;
import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class HolidayDto {
    private int holidayId;

    @NotNull(message = "Name is required")
    private String name;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Coefficient is required")
    private float coefficient;

    public HolidayDto(Holiday holiday) {
        this.holidayId = holiday.getHolidayId();
        this.name = holiday.getName();
        this.startDate = holiday.getStartDate();
        this.endDate = holiday.getEndDate();
        this.coefficient = holiday.getCoefficient();
    }
}
