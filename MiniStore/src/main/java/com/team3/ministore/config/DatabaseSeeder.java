package com.team3.ministore.config;

import com.team3.ministore.dto.RegisterDto;
import com.team3.ministore.dto.SalaryDto;
import com.team3.ministore.model.Staff;
import com.team3.ministore.service.SalaryService;
import com.team3.ministore.service.StaffService;
import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private StaffService staffService;

    @Autowired
    private SalaryService salaryService;

    @Override
    public void run(String... args) throws Exception {
        if (staffService.getAllStaffs().size() > 0) return;

        // Create admin account
        RegisterDto dto = new RegisterDto();
        dto.setUsername("admin");
        dto.setStaffName("admin");
        dto.setPassword("123456");
        dto.setEmail("admin@mail.com");
        dto.setRole(Role.ADMIN);
        dto.setStatus(StaffStatus.ACTIVE);
        dto.setImage("");
        dto.setPhoneNumber("0123456789");
        dto.setWorkDays("Whole week");
        dto.setLeaveBalance(0);
        dto.setHourlyWage("100000");
        dto.setEffectiveDate(LocalDate.now());
        dto.setTerminationDate(null);

        Staff staff = staffService.createStaff(dto);
        SalaryDto salaryDto = new SalaryDto(
                dto.getHourlyWage(),
                dto.getEffectiveDate(),
                dto.getTerminationDate(),
                staff.getStaffId()
        );
        salaryService.createSalary(salaryDto, staff);
    }
}
