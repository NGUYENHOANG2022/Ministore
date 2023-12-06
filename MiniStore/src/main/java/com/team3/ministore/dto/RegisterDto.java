package com.team3.ministore.dto;

import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import com.team3.ministore.validation.annotation.ExistEmail;
import com.team3.ministore.validation.annotation.ExistUsername;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class RegisterDto {
    @ExistUsername
    @NotBlank(message = "Username must not be blank")
    private String username;

    @NotBlank(message = "Password must not be blank")
    private String password;

    @ExistEmail
    @Email
    @NotBlank(message = "Email must not be blank")
    private String email;

    @NotBlank(message = "Staff name must not be blank")
    private String staffName;

    @NotNull(message = "Role must not be blank")
    private Role role;

    @NotNull(message = "Hourly wage must not be null")
    private String hourlyWage;

    @NotNull(message = "EffectiveDate name must not be null")
    private LocalDate effectiveDate;

    private LocalDate terminationDate;

    private String phoneNumber;

    private StaffStatus status;

    private String image;

    private String workDays;

    private Integer leaveBalance;
}
