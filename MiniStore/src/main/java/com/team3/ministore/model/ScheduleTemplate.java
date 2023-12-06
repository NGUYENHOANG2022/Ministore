package com.team3.ministore.model;

import lombok.Data;

import javax.persistence.*;
import java.util.List;

@Entity
@Data
@Table(name = "scheduletemplates")
public class ScheduleTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_template_id")
    private int scheduleTemplateId;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "description", length = 400)
    private String description;

    @Column(name = "num_of_shifts")
    private int numOfShifts;

    @OneToMany(mappedBy = "scheduleTemplate")
    private List<ScheduleShiftTemplate> scheduleShiftTemplates;
}
