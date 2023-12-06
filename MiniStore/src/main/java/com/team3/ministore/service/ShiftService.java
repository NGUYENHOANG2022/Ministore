package com.team3.ministore.service;

import com.team3.ministore.dto.CreateShiftDto;
import com.team3.ministore.dto.ShiftDto;
import com.team3.ministore.model.Shift;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ShiftService {
    List<Shift> getAllShifts();

    List<Shift> getAllShiftsByStaffId(int staffId, LocalDate from, LocalDate to);

    Optional<ShiftDto> createShift(CreateShiftDto shift);

    Optional<Shift> getShiftById(Integer id);

    ShiftDto updateShift(Shift shift);

    void deleteShift(Integer id);

    List<Shift> getAllShifts(LocalDate fromDate, LocalDate toDate);

    List<ShiftDto> createShifts(List<CreateShiftDto> dtos);
}
