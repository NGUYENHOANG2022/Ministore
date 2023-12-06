package com.team3.ministore.dto;

import com.team3.ministore.model.Staff;
import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import lombok.Data;

@Data
public class StaffMetaInfo {
    private int staffId;
    private String username;
    private String staffName;
    private String email;
    private Role role;
    private StaffStatus status;

    public StaffMetaInfo(Staff staff){
        this.staffId = staff.getStaffId();
        this.username = staff.getUsername();
        this.staffName = staff.getStaffName();
        this.email = staff.getEmail();
        this.role = staff.getRole();
        this.status = staff.getStatus();
    }
}
