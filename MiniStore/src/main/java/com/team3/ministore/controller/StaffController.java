package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.RegisterDto;
import com.team3.ministore.dto.SalaryDto;
import com.team3.ministore.dto.StaffDto;
import com.team3.ministore.dto.UpdateStaffDto;
import com.team3.ministore.model.Salary;
import com.team3.ministore.model.Staff;
import com.team3.ministore.service.SalaryService;
import com.team3.ministore.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/staffs")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @Autowired
    private SalaryService salaryService;


    //Create new staff
    @PostMapping("/add")
    public ResponseEntity<Object> register(@Valid @RequestBody RegisterDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Staff staff = staffService.createStaff(dto);
        SalaryDto salaryDto = new SalaryDto(
                dto.getHourlyWage(),
                dto.getEffectiveDate(),
                dto.getTerminationDate(),
                staff.getStaffId()
        );
        Salary salary = salaryService.createSalary(salaryDto, staff);
        salaryDto.setSalaryId(salary.getSalaryId());

        return ResponseHandler.getResponse(new StaffDto(staff, salaryDto), HttpStatus.CREATED);
    }

    //Read a staff by ID
    @GetMapping("/{id}")
    public ResponseEntity<Object> getStaffById(@PathVariable("id") Integer id) {
        Optional<Staff> staff = staffService.getStaffById(id);

        return staff.map(value ->
                        ResponseHandler.getResponse(new StaffDto(value,
                                        salaryService.getSalaryByStaffId(value.getStaffId())),
                                HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Invalid staff id"),
                        HttpStatus.BAD_REQUEST));
    }

    //Update an existing staff
    @PutMapping("/{id}/edit")
    public ResponseEntity<Object> updateStaff(@PathVariable("id") Integer id,
                                              @Valid @RequestBody UpdateStaffDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<Staff> updatedStaff = staffService.updateStaff(id, dto);

        if (updatedStaff.isEmpty())
            return ResponseHandler.getResponse(new Exception("Invalid staff id"), HttpStatus.BAD_REQUEST);

        SalaryDto curSalary = salaryService.getSalaryByStaffId(updatedStaff.get().getStaffId());

        // Update salary if hourly wage and effective date are changed
        if (curSalary != null && dto.getHourlyWage() != null && !dto.getHourlyWage().equals(curSalary.getHourlyWage())) {

            SalaryDto newSalaryDto = new SalaryDto(
                    dto.getHourlyWage(),
                    dto.getEffectiveDate(),
                    dto.getTerminationDate(),
                    updatedStaff.get().getStaffId()
            );
            Salary salary = salaryService.createSalary(newSalaryDto, updatedStaff.get());
            newSalaryDto.setSalaryId(salary.getSalaryId());

            // Update old salary
            curSalary.setTerminationDate(dto.getEffectiveDate());
            salaryService.updateSalary(curSalary.getSalaryId(), curSalary);

            return ResponseHandler.getResponse(new StaffDto(updatedStaff.get(), newSalaryDto), HttpStatus.OK);
        }

        return ResponseHandler.getResponse(new StaffDto(updatedStaff.get(), curSalary), HttpStatus.OK);
    }

    //Delete a staff
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable Integer id) {
        staffService.deleteStaff(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping()
    public ResponseEntity<Object> getStaffs(@RequestParam("search") Optional<String> search,
                                            @RequestParam("curPage") Integer curPage,
                                            @RequestParam("perPage") Integer perPage) {
        return search.map(s -> ResponseHandler.getResponse(staffService.getAllStaff(s, curPage, perPage), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(staffService.getAllStaff(curPage, perPage), HttpStatus.OK));
    }

    @GetMapping("/meta-infos")
    public ResponseEntity<Object> getStaffs() {
        return ResponseHandler.getResponse(staffService.getAllStaffMetaInfos(), HttpStatus.OK);
    }

}
