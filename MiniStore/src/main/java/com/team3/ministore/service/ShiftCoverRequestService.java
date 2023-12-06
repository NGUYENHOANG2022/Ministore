package com.team3.ministore.service;

import com.team3.ministore.dto.ShiftCoverDto;
import com.team3.ministore.model.ShiftCoverRequest;
import org.springframework.data.domain.Page;
import org.springframework.validation.BindingResult;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ShiftCoverRequestService {
    Page<ShiftCoverRequest> getAllShiftCoverRequests(Optional<String> search, Integer page, Integer pageSize);

    Optional<ShiftCoverDto> createShiftCoverRequest(ShiftCoverDto dto);

    Optional<ShiftCoverDto> updateShiftCoverRequest(Integer id, ShiftCoverDto dto);

    void deleteShiftCoverRequest(Integer id);

    List<ShiftCoverDto> getShiftCoverRequestsByStaffIdAndDates(Integer id, LocalDate from, LocalDate to);

    Page<ShiftCoverRequest> getShiftCoverRequestsByStaffId(Integer staffId, Integer page, Integer pageSize);
}
