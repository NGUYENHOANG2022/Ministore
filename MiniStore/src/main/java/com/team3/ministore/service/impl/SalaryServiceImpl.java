package com.team3.ministore.service.impl;

import com.team3.ministore.dto.SalaryDto;
import com.team3.ministore.model.Salary;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.SalaryRepository;
import com.team3.ministore.service.SalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SalaryServiceImpl implements SalaryService {

    @Autowired
    private SalaryRepository salaryRepository;

    @Override
    public List<Salary> getAllSalary() {
        return salaryRepository.findAll();
    }

    @Override
    public SalaryDto getSalaryByStaffId(Integer staffId) {
        return salaryRepository.findSalaryInformationByStaffId(staffId).map(SalaryDto::new).orElse(null);
    }

    @Override
    public List<SalaryDto> getSalaryOfAllStaffs() {
        return salaryRepository.findSalaryOfAllStaffs().stream().map(SalaryDto::new).collect(Collectors.toList());
    }

    @Override
    public Salary createSalary(SalaryDto dto, Staff staff) {
        Salary salary = new Salary();
        salary.setHourlyWage(dto.getHourlyWage());
        salary.setEffectiveDate(dto.getEffectiveDate());
        salary.setTerminationDate(dto.getTerminationDate());
        salary.setStaff(staff);
        return salaryRepository.save(salary);
    }

    @Override
    public Optional<Salary> updateSalary(Integer id, SalaryDto dto) {
        Optional<Salary> existingSalary = salaryRepository.findById(id);

        if (existingSalary.isEmpty()) return Optional.empty();

        return existingSalary.map(salary -> {
            salary.setStaff(salary.getStaff());
            salary.setHourlyWage(dto.getHourlyWage());
            salary.setEffectiveDate(dto.getEffectiveDate());
            salary.setTerminationDate(dto.getTerminationDate());
            return salaryRepository.save(salary);
        });
    }

    @Override
    public void deleteSalary(Integer id) {
        salaryRepository.deleteById(id);
    }

    @Override
    public Optional<Salary> getSalaryById(Integer id) {
        return salaryRepository.findById(id);
    }
}
