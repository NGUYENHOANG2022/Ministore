package com.team3.ministore.model;

import com.team3.ministore.utils.LeaveStatus;
import com.team3.ministore.utils.LeaveType;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "leaverequests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "leave_request_id")
    private int leaveRequestId;

    @Column(name = "leave_type")
    @Enumerated(EnumType.STRING)
    private LeaveType leaveType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "status")
    @Enumerated(EnumType.ORDINAL)
    private LeaveStatus status;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "admin_reply", length = 500)
    private String adminReply;

    @ManyToOne
    @JoinColumn(name = "staff_id", referencedColumnName = "staff_id")
    private Staff staff;

}
