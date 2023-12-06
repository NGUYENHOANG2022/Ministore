package com.team3.ministore.dto;

import com.team3.ministore.model.Salary;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@RequiredArgsConstructor
@AllArgsConstructor
public class SalaryDto {
    @NotNull
    private String hourlyWage;
    @NotNull
    private LocalDate effectiveDate;
    @NotNull
    private LocalDate terminationDate;
    @NotNull
    private int staffId;
    private int salaryId;

    public SalaryDto(Salary salary){
        this.hourlyWage = salary.getHourlyWage();
        this.effectiveDate = salary.getEffectiveDate();
        this.terminationDate = salary.getTerminationDate();
        this.staffId = salary.getStaff().getStaffId();
        this.salaryId = salary.getSalaryId();
    }

    public SalaryDto(String hourlyWage, LocalDate effectiveDate, LocalDate terminationDate, int staffId) {
        this.hourlyWage = hourlyWage;
        this.effectiveDate = effectiveDate;
        this.terminationDate = terminationDate;
        this.staffId = staffId;
    }
}
