package com.team3.ministore.service.impl;

import com.team3.ministore.dto.RegisterDto;
import com.team3.ministore.dto.StaffDto;
import com.team3.ministore.dto.StaffMetaInfo;
import com.team3.ministore.dto.UpdateStaffDto;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.StaffRepository;
import com.team3.ministore.service.SalaryService;
import com.team3.ministore.service.StaffService;
import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder encoder;

    @Autowired
    private SalaryService salaryService;

    public StaffServiceImpl(StaffRepository staffRepository, PasswordEncoder encoder) {
        this.staffRepository = staffRepository;
        this.encoder = encoder;
    }

    @Override
    public List<Staff> getAllStaffs() {
        return staffRepository.findAll();
    }

    @Override
    public List<Staff> getAllStaffs(String search) {
        return staffRepository.findByStaffNameContainingIgnoreCaseOrderByStaffIdDesc(search);
    }

    @Override
    public Optional<Staff> getStaffById(Integer id) {
        return staffRepository.findById(id);
    }

    @Override
    public Staff createStaff(RegisterDto staffDto) {
        Staff staff = new Staff();
        staff.setPassword(encoder.encode(staffDto.getPassword()));

        return saveStaff(
                staff,
                staffDto.getStaffName(),
                staffDto.getRole(),
                staffDto.getUsername(),
                staffDto.getPhoneNumber(),
                staffDto.getStatus(),
                staffDto.getImage(),
                staffDto.getEmail(),
                staffDto.getWorkDays(),
                staffDto.getLeaveBalance()
        );
    }

    @Override
    public Optional<Staff> updateStaff(Integer id, UpdateStaffDto staff) {
        Optional<Staff> existingStaff = getStaffById(id);

        return existingStaff.map(value -> saveStaff(
                value,
                staff.getStaffName(),
                staff.getRole(),
                staff.getUsername(),
                staff.getPhoneNumber(),
                staff.getStatus(),
                staff.getImage(),
                staff.getEmail(),
                staff.getWorkDays(),
                staff.getLeaveBalance()
        ));
    }

    @Override
    public void deleteStaff(Integer id) {
        staffRepository.deleteById(id);
    }

    @Override
    public Page<StaffDto> getAllStaff(String search, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return staffRepository.findByStaffNameContainingIgnoreCaseOrderByStaffIdDesc(search, pageable)
                .map(staff -> new StaffDto(staff, salaryService.getSalaryByStaffId(staff.getStaffId())));
    }

    @Override
    public Page<StaffDto> getAllStaff(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return staffRepository.findAll(pageable)
                .map(staff -> new StaffDto(staff, salaryService.getSalaryByStaffId(staff.getStaffId())));
    }

    @Override
    public Optional<Staff> getStaffByEmail(String email) {
        return staffRepository.findByEmail(email);
    }

    @Override
    public Optional<Staff> getStaffByUsername(String username) {
        return staffRepository.findByUsername(username);
    }

    @Override
    public List<StaffMetaInfo> getAllStaffMetaInfos() {
        return staffRepository.findAll().stream().filter(s -> s.getStatus() == StaffStatus.ACTIVE)
                .map(StaffMetaInfo::new).collect(Collectors.toList());
    }


    private Staff saveStaff(Staff staff, String staffName, Role role, String username, String phoneNumber, StaffStatus status, String image, String email, String workDays, Integer leaveBalance) {
        staff.setStaffName(staffName);
        staff.setRole(role);
        staff.setUsername(username);
        staff.setEmail(email);
        staff.setPhoneNumber(phoneNumber == null ? "" : phoneNumber);
        staff.setStatus(status == null ? StaffStatus.ACTIVE : status);
        staff.setImage(image == null ? "" : image);
        staff.setWorkDays(workDays == null ? "" : workDays);
        staff.setLeaveBalance(leaveBalance == null ? 0 : leaveBalance);

        return staffRepository.save(staff);
    }

}
