package com.team3.ministore.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.team3.ministore.utils.Role;
import com.team3.ministore.utils.StaffStatus;
import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.List;

@Entity
@Data
@Table(name = "staffs")
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id")
    private int staffId;

    @Column(name = "staff_name", length = 100)
    private String staffName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @NotNull
    @Column(name = "username", length = 100)
    private String username;

    @NotNull
    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "password", length = 100)
    @NotNull
    @JsonIgnore
    private String password;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "status")
    @Enumerated(EnumType.ORDINAL)
    private StaffStatus status;

    @Column(name = "image", length = 200)
    private String image;

    @Column(name = "work_days", length = 200)
    private String workDays;

    @Column(name = "leave_balance")
    private Integer leaveBalance;

    @OneToMany(mappedBy = "staff")
    private List<LeaveRequest> leaveRequests;
}
