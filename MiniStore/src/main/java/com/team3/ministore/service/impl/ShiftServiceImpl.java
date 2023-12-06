package com.team3.ministore.service.impl;

import com.team3.ministore.dto.CreateShiftDto;
import com.team3.ministore.dto.ShiftDto;
import com.team3.ministore.model.Shift;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.ShiftRepository;
import com.team3.ministore.repository.StaffRepository;
import com.team3.ministore.service.ShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShiftServiceImpl implements ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Override
    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    @Override
    public List<Shift> getAllShiftsByStaffId(int staffId, LocalDate from, LocalDate to) {
        return shiftRepository.findAllByStaff_StaffIdAndDateBetween(staffId, from, to);
    }

    @Override
    public Optional<ShiftDto> createShift(CreateShiftDto dto) {
        Shift shift = new Shift();

        Optional<Staff> staff = staffRepository.findById(dto.getStaffId());
        if (staff.isEmpty()) return Optional.empty();

        shift.setStaff(staff.get());
        shift.setDate(dto.getDate());
        shift.setPublished(dto.isPublished());
        shift.setStartTime(dto.getStartTime());
        shift.setEndTime(dto.getEndTime());
        shift.setName(dto.getName());
        shift.setSalaryCoefficient(dto.getSalaryCoefficient());
        shift.setRole(dto.getRole());

        return Optional.of(new ShiftDto(shiftRepository.save(shift)));
    }

    @Override
    public List<ShiftDto> createShifts(List<CreateShiftDto> dtos) {
        return dtos.stream().map(this::createShift)
                .filter(Optional::isPresent).map(Optional::get).collect(Collectors.toList());
    }

    @Override
    public Optional<Shift> getShiftById(Integer id) {
        return shiftRepository.findById(id);
    }

    @Override
    public ShiftDto updateShift(Shift shift) {
        return new ShiftDto(shiftRepository.save(shift));
    }

    @Override
    public void deleteShift(Integer id) {
        shiftRepository.deleteById(id);
    }

    @Override
    public List<Shift> getAllShifts(LocalDate fromDate, LocalDate toDate) {
        return shiftRepository.findAllByDateBetween(fromDate, toDate);
    }
}
