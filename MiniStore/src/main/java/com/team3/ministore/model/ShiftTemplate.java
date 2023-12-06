package com.team3.ministore.model;

import com.team3.ministore.utils.Role;
import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.sql.Time;

@Entity
@Data
@Table(name = "shifttemplates")
public class ShiftTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_template_id")
    private int shiftTemplateId;

    @Column(name = "start_time")
    private Time startTime;

    @Column(name = "end_time")
    private Time endTime;

    @NotNull
    @Column(name = "name", length = 50)
    private String name;

    @Column(name = "salary_coefficient")
    private Float salaryCoefficient;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

}
