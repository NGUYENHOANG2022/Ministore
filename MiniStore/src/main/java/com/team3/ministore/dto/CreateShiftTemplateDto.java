package com.team3.ministore.dto;

import com.team3.ministore.utils.Role;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.sql.Time;

@Data
public class CreateShiftTemplateDto {
    @NotNull(message = "Start time must not be null")
    private Time startTime;

    @NotNull(message = "End time must not be null")
    private Time endTime;

    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotNull(message = "Salary coefficient must not be null")
    private Float salaryCoefficient;

    @NotNull(message = "Role must not be null")
    private Role role;
}
