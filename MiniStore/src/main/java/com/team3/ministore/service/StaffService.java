package com.team3.ministore.service;

import com.team3.ministore.dto.RegisterDto;
import com.team3.ministore.dto.StaffDto;
import com.team3.ministore.dto.StaffMetaInfo;
import com.team3.ministore.dto.UpdateStaffDto;
import com.team3.ministore.model.Staff;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Optional;

public interface StaffService {
    List<Staff> getAllStaffs();

    List<Staff> getAllStaffs(String search);

    Optional<Staff> getStaffById(Integer id);

    Staff createStaff(RegisterDto staff);

    Optional<Staff> updateStaff(Integer id, UpdateStaffDto staff);

    void deleteStaff(Integer id);

    Page<StaffDto> getAllStaff(String search, int page, int pageSize);

    Page<StaffDto> getAllStaff(int page, int pageSize);

    Optional<Staff> getStaffByEmail(String email);

    Optional<Staff> getStaffByUsername(String username);

    List<StaffMetaInfo> getAllStaffMetaInfos();
}
