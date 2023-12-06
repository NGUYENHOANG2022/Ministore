package com.team3.ministore.service;

import com.team3.ministore.dto.SalaryDto;
import com.team3.ministore.model.Salary;
import com.team3.ministore.model.Staff;

import java.util.List;
import java.util.Optional;

public interface SalaryService {
    List<Salary> getAllSalary();

    SalaryDto getSalaryByStaffId(Integer staffId);

    List<SalaryDto> getSalaryOfAllStaffs();

    Salary createSalary(SalaryDto salary, Staff staff);

    Optional<Salary> updateSalary(Integer id, SalaryDto dto);

    void deleteSalary(Integer id);

    Optional<Salary> getSalaryById(Integer timesheetId);
}
