package com.team3.ministore.service;

import com.team3.ministore.dto.ScheduleTemplateDto;
import com.team3.ministore.model.ScheduleTemplate;

import java.util.List;
import java.util.Optional;

public interface ScheduleTemplateService {
    List<ScheduleTemplate> getAllScheduleTemplates();

    ScheduleTemplateDto createScheduleTemplate(ScheduleTemplateDto scheduleTemplate);

    Optional<ScheduleTemplate> getScheduleTemplateById(Integer id);

    void deleteScheduleTemplate(Integer id);
}
