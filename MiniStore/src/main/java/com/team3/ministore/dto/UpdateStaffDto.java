package com.team3.ministore.dto;

import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class UpdateStaffDto {
    @Email
    @NotBlank(message = "Email must not be blank")
    private String email;

    @NotBlank(message = "Username must not be blank")
    private String username;

    @NotBlank(message = "Staff name must not be blank")
    private String staffName;

    @NotNull(message = "Role must not be blank")
    private Role role;

    private String phoneNumber;

    @NotNull(message = "Status must not be blank")
    private StaffStatus status;

    private String image;

    private String workDays;

    @NotNull(message = "leaveBalance must not be blank")
    private Integer leaveBalance;

    private String hourlyWage;

    private LocalDate effectiveDate;

    private LocalDate terminationDate;

}
