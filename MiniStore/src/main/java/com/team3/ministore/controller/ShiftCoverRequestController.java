package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.ShiftCoverDto;
import com.team3.ministore.jwt.JwtUtils;
import com.team3.ministore.model.Staff;
import com.team3.ministore.service.ShiftCoverRequestService;
import com.team3.ministore.service.StaffService;
import com.team3.ministore.utils.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/shift-cover-requests")
public class ShiftCoverRequestController {

    @Autowired
    private ShiftCoverRequestService shiftCoverRequestService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private JwtUtils jwt;

    @GetMapping()
    public ResponseEntity<Object> getAllShiftCoverRequests(@RequestParam("search") Optional<String> search,
                                                           @RequestParam("curPage") Optional<Integer> curPage,
                                                           @RequestParam("perPage") Optional<Integer> perPage,
                                                           HttpServletRequest request) {
        if (jwt.getJwtTokenFromRequest(request) != null) {
            Optional<Staff> staff = staffService.getStaffByUsername(jwt.getUsernameFromToken(jwt.getJwtTokenFromRequest(request)));

            if (staff.isPresent() && !staff.get().getRole().equals(Role.ADMIN)) {
                return ResponseHandler.getResponse(
                        shiftCoverRequestService.getShiftCoverRequestsByStaffId(staff.get().getStaffId(), curPage.orElseGet(() -> null), perPage.orElseGet(() -> null))
                                .map(sc -> new ShiftCoverDto(sc, true, true)),
                        HttpStatus.OK);
            }
        }

        return ResponseHandler.getResponse(
                shiftCoverRequestService.getAllShiftCoverRequests(search, curPage.orElseGet(() -> null), perPage.orElseGet(() -> null))
                        .map(sc -> new ShiftCoverDto(sc, true, true)), HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createShiftCoverRequests(@Valid @RequestBody ShiftCoverDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<ShiftCoverDto> createdShiftCoverRequest = shiftCoverRequestService.createShiftCoverRequest(dto);

        if (createdShiftCoverRequest.isEmpty())
            return ResponseHandler.getResponse(new Exception("Staff or shift not found"), HttpStatus.NOT_FOUND);

        return ResponseHandler.getResponse(createdShiftCoverRequest, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateShiftCoverRequests(@Valid @PathVariable("id") Integer id,
                                                           @RequestBody ShiftCoverDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<ShiftCoverDto> updatedShiftCoverRequest = shiftCoverRequestService.updateShiftCoverRequest(id, dto);

        return updatedShiftCoverRequest.map(value -> ResponseHandler.getResponse(value, HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Invalid staff id or shift cover request id"),
                        HttpStatus.BAD_REQUEST));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteShiftCoverRequests(@PathVariable("id") Integer id) {
        shiftCoverRequestService.deleteShiftCoverRequest(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }
}
