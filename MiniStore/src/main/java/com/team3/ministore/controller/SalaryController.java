package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.SalaryDto;
import com.team3.ministore.model.Salary;
import com.team3.ministore.model.Staff;
import com.team3.ministore.service.SalaryService;
import com.team3.ministore.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/salary")
public class SalaryController {

    @Autowired
    private SalaryService salaryService;

    @Autowired
    private StaffService staffService;

    @GetMapping("")
    public ResponseEntity<List<Salary>> getAllSalary() {
        List<Salary> salaryList = salaryService.getAllSalary();
        return new ResponseEntity<>(salaryList, HttpStatus.OK);
    }

    @GetMapping("/staff/{id}")
    public ResponseEntity<SalaryDto> getStaffSalary(@PathVariable("id") Integer id) {
       SalaryDto salaryList = salaryService.getSalaryByStaffId(id);
        return new ResponseEntity<>(salaryList, HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createSalary(@RequestBody SalaryDto dto) {
        Optional<Staff> staff = staffService.getStaffById(dto.getStaffId());

        if (staff.isEmpty()) return ResponseHandler.getResponse(new Exception("Staff not found"),
                        HttpStatus.BAD_REQUEST);

        Salary createdSalary = salaryService.createSalary(dto, staff.get());
        return new ResponseEntity<>(createdSalary, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSalary(@PathVariable("id") Integer id) {
        salaryService.deleteSalary(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
