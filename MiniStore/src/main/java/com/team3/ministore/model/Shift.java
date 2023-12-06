package com.team3.ministore.model;

import com.team3.ministore.utils.Role;
import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.sql.Time;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "shifts")
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_id")
    private int shiftId;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "published")
    private Boolean published;

    @Column(name = "start_time")
    private Time startTime;

    @Column(name = "end_time")
    private Time endTime;

    @Column(name = "name", length = 50)
    private String name;

    @Column(name = "salary_coefficient")
    private Float salaryCoefficient;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @OneToOne
    @JoinColumn(name = "timesheet_id")
    private Timesheet timesheet;

    @OneToOne
    @JoinColumn(name = "shift_cover_request_id")
    private ShiftCoverRequest shiftCoverRequest;

}
