package com.team3.ministore.service;

import com.team3.ministore.model.ScheduleShiftTemplate;

import java.util.List;

public interface ScheduleShiftTemplateService {
    List<ScheduleShiftTemplate> getAllShiftScheduleTemplates();

    ScheduleShiftTemplate createShiftScheduleTemplates(ScheduleShiftTemplate scheduleShiftTemplate);

    void deleteShiftScheduleTemplates(Integer id);
}
