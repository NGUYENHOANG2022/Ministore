package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.CreateShiftDto;
import com.team3.ministore.dto.ShiftDto;
import com.team3.ministore.model.Shift;
import com.team3.ministore.model.Staff;
import com.team3.ministore.service.ShiftService;
import com.team3.ministore.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/shifts")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private StaffService staffService;

    @PostMapping("/add")
    public ResponseEntity<Object> createShift(@Valid @RequestBody CreateShiftDto shift, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<ShiftDto> createdShift = shiftService.createShift(shift);

        return createdShift.map(value -> ResponseHandler.getResponse(value, HttpStatus.CREATED))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Invalid staff id"),
                        HttpStatus.BAD_REQUEST));
    }

    @PostMapping("/add/multiple")
    public ResponseEntity<Object> createShifts(@Valid @RequestBody List<CreateShiftDto> dtos, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        List<ShiftDto> createdShifts = shiftService.createShifts(dtos);

        return ResponseHandler.getResponse(createdShifts, HttpStatus.CREATED);
    }

    @GetMapping("/list")
    public ResponseEntity<Object> getAllShifts() {
        return ResponseHandler.getResponse(shiftService.getAllShifts(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getShiftById(@PathVariable("id") Integer id) {
        Optional<Shift> shift = shiftService.getShiftById(id);
        return new ResponseEntity<>(shift, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateShift(@Valid @PathVariable("id") Integer id, @RequestBody CreateShiftDto dto,
                                              BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<Shift> shift = shiftService.getShiftById(id);
        Optional<Staff> foundStaff = staffService.getStaffById(dto.getStaffId());

        return foundStaff.map(staff -> shift.map(value -> {
                    value.setStartTime(dto.getStartTime());
                    value.setEndTime(dto.getEndTime());
                    value.setDate(dto.getDate());
                    value.setRole(dto.getRole());
                    value.setSalaryCoefficient(dto.getSalaryCoefficient());
                    value.setPublished(dto.isPublished());
                    value.setName(dto.getName());
                    value.setStaff(staff);

                    return ResponseHandler.getResponse(shiftService.updateShift(shift.get()), HttpStatus.OK);
                }).orElseGet(() -> ResponseHandler.getResponse(new Exception("Shift not found"), HttpStatus.NOT_FOUND)))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Staff not found"), HttpStatus.NOT_FOUND));

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteShifts(@PathVariable("id") Integer id) {
        shiftService.deleteShift(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }
}

