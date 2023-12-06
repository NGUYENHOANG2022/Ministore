package com.team3.ministore.model;

import com.team3.ministore.utils.Role;
import lombok.Data;

import javax.persistence.*;
import java.sql.Time;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "scheduleshifttemplates")
public class ScheduleShiftTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_shift_template_id")
    private int scheduleShiftTemplateId;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "start_time")
    private Time startTime;

    @Column(name = "end_time")
    private Time endTime;

    @Column(name = "name", length = 50)
    private String name;

    @Column(name = "role")
    private Role role;

    @Column(name = "salary_coefficient")
    private Float salaryCoefficient;

    @ManyToOne
    @JoinColumn(name = "schedule_template_id")
    private ScheduleTemplate scheduleTemplate;

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private Staff staff;

}
