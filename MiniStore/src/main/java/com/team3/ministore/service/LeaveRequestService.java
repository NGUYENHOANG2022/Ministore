package com.team3.ministore.service;

import com.team3.ministore.dto.LeaveRequestDto;
import com.team3.ministore.model.LeaveRequest;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveRequestService {

    Page<LeaveRequest> getAllLeaveRequest(Optional<String> search, int page, int pageSize);

    Optional<LeaveRequestDto> createLeaveRequest(LeaveRequestDto leaveRequest);

    List<LeaveRequestDto> getLeaveRequestsByStaffIdAndDates(Integer id, LocalDate startDate, LocalDate endDate);

    Optional<LeaveRequestDto> updateLeaveRequest(Integer id, LeaveRequestDto dto);

    void deleteLeaveRequest(Integer id);

    Page<LeaveRequest> getLeaveRequestsByStaffId(int staffId, int page, int pageSize);
}
