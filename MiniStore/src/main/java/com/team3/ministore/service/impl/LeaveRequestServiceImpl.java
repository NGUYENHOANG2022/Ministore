package com.team3.ministore.service.impl;

import com.team3.ministore.dto.LeaveRequestDto;
import com.team3.ministore.model.LeaveRequest;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.LeaveRequestRepository;
import com.team3.ministore.repository.StaffRepository;
import com.team3.ministore.service.LeaveRequestService;
import com.team3.ministore.utils.StaffStatus;
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
public class LeaveRequestServiceImpl implements LeaveRequestService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Override
    public Page<LeaveRequest> getAllLeaveRequest(Optional<String> search, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        return leaveRequestRepository.findAllByFilter(search.orElseGet(() -> null), pageable);
    }

    @Override
    public Page<LeaveRequest> getLeaveRequestsByStaffId(int staffId, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);

        return leaveRequestRepository.findAllByStaff_StaffIdOrderByLeaveRequestIdDesc(staffId, pageable);
    }

    @Override
    public Optional<LeaveRequestDto> createLeaveRequest(LeaveRequestDto dto) {
        LeaveRequest leave = new LeaveRequest();

        Optional<Staff> staff = staffRepository.findById(dto.getStaffId());
        if (staff.isEmpty() || staff.get().getStatus() == StaffStatus.DISABLED) return Optional.empty();

        leave.setStaff(staff.get());
        leave.setLeaveType(dto.getLeaveType());
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setReason(dto.getReason());
        leave.setAdminReply(dto.getAdminReply());
        leave.setStatus(dto.getStatus());


        return Optional.of(new LeaveRequestDto(leaveRequestRepository.save(leave)));
    }

    public List<LeaveRequestDto> getLeaveRequestsByStaffIdAndDates(Integer id, LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findLeaveRequestsByStaffIdAndDates(id, startDate, endDate)
                .stream().map(value -> new LeaveRequestDto(value, false)).collect(Collectors.toList());
    }


    @Override
    public Optional<LeaveRequestDto> updateLeaveRequest(Integer id, LeaveRequestDto dto) {
        Optional<LeaveRequest> existingLeaveRequest = leaveRequestRepository.findById(id);
        Optional<Staff> staff = staffRepository.findById(dto.getStaffId());

        if (staff.isEmpty() || staff.get().getStatus() == StaffStatus.DISABLED) return Optional.empty();

        if (existingLeaveRequest.isEmpty()) return Optional.empty();

        existingLeaveRequest.map(value -> {
            value.setLeaveType(dto.getLeaveType());
            value.setStartDate(dto.getStartDate());
            value.setEndDate(dto.getEndDate());
            value.setReason(dto.getReason());
            value.setAdminReply(dto.getAdminReply());
            value.setStatus(dto.getStatus());
            value.setStaff(staff.get());
            return value;
        });

        return Optional.of(new LeaveRequestDto(leaveRequestRepository.save(existingLeaveRequest.get())));
    }

    @Override
    public void deleteLeaveRequest(Integer id) {
        leaveRequestRepository.deleteById(id);
    }

}
