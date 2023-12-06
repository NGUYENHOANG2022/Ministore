package com.team3.ministore.service.impl;

import com.team3.ministore.dto.ShiftCoverDto;
import com.team3.ministore.model.Shift;
import com.team3.ministore.model.ShiftCoverRequest;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.ShiftCoverRequestRepository;
import com.team3.ministore.repository.ShiftRepository;
import com.team3.ministore.repository.StaffRepository;
import com.team3.ministore.service.ShiftCoverRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ShiftCoverRequestServiceImpl implements ShiftCoverRequestService {

    @Autowired
    private ShiftCoverRequestRepository shiftCoverRequestRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Override
    public Page<ShiftCoverRequest> getAllShiftCoverRequests(Optional<String> search, Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return shiftCoverRequestRepository.findAllByFilter(search.orElseGet(() -> null), pageable);
    }

    @Override
    public Page<ShiftCoverRequest> getShiftCoverRequestsByStaffId(Integer staffId, Integer page, Integer pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return shiftCoverRequestRepository
                .findAllByShift_Staff_StaffIdOrderByShiftCoverRequestIdDesc(staffId, pageable);
    }

    @Override
    public Optional<ShiftCoverDto> createShiftCoverRequest(ShiftCoverDto dto) {

        Optional<Staff> staff = staffRepository.findById(dto.getStaffId());
        if (staff.isEmpty()) return Optional.empty();

        Optional<Shift> shift = shiftRepository.findById(dto.getShiftId());
        if (shift.isEmpty()) return Optional.empty();

        ShiftCoverRequest shiftCoverRequest = new ShiftCoverRequest();
        shiftCoverRequest.setStaff(staff.get());
        shiftCoverRequest.setNote(dto.getNote());
        shiftCoverRequest.setStatus(dto.getStatus());
        shiftCoverRequest.setShift(shift.get());

        ShiftCoverRequest result = shiftCoverRequestRepository.save(shiftCoverRequest);
        shift.get().setShiftCoverRequest(result);
        shiftRepository.save(shift.get());

        return Optional.of(new ShiftCoverDto(result));
    }

    @Override
    public Optional<ShiftCoverDto> updateShiftCoverRequest(Integer id, ShiftCoverDto dto) {
        Optional<ShiftCoverRequest> existingShiftCoverRequest = shiftCoverRequestRepository.findById(id);
        if (existingShiftCoverRequest.isEmpty()) return Optional.empty();

        Optional<Staff> staff = staffRepository.findById(dto.getStaffId());
        if (staff.isEmpty()) return Optional.empty();

        Optional<Shift> shift = shiftRepository.findById(dto.getShiftId());
        if (shift.isEmpty()) return Optional.empty();

        existingShiftCoverRequest.map(shiftCoverRequest -> {
            shiftCoverRequest.setStaff(staff.get());
            shiftCoverRequest.setNote(dto.getNote());
            shiftCoverRequest.setStatus(dto.getStatus());
            shiftCoverRequest.setShift(shift.get());
            return shiftCoverRequest;
        });

        ShiftCoverRequest result = shiftCoverRequestRepository.save(existingShiftCoverRequest.get());

        shift.get().setShiftCoverRequest(result);
        shiftRepository.save(shift.get());

        return Optional.of(new ShiftCoverDto(result));
    }

    @Override
    public void deleteShiftCoverRequest(Integer id) {
        shiftCoverRequestRepository.deleteById(id);
    }

    public List<ShiftCoverDto> getShiftCoverRequestsByStaffIdAndDates(Integer staffId, LocalDate from, LocalDate to) {
        return shiftCoverRequestRepository
                .findAllByStaff_StaffIdAndShift_DateBetween(staffId, from, to)
                .stream().map(sc -> new ShiftCoverDto(sc, true, true))
                .collect(Collectors.toList());
    }

}
