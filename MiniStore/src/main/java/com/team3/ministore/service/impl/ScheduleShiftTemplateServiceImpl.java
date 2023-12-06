package com.team3.ministore.service.impl;

import com.team3.ministore.model.ScheduleShiftTemplate;
import com.team3.ministore.repository.ScheduleShiftTemplateRepository;
import com.team3.ministore.service.ScheduleShiftTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleShiftTemplateServiceImpl implements ScheduleShiftTemplateService {

    @Autowired
    private ScheduleShiftTemplateRepository scheduleShiftTemplateRepository;


    @Override
    public List<ScheduleShiftTemplate> getAllShiftScheduleTemplates() {
        return scheduleShiftTemplateRepository.findAll();
    }

    @Override
    public ScheduleShiftTemplate createShiftScheduleTemplates(ScheduleShiftTemplate scheduleShiftTemplate) {
        return scheduleShiftTemplateRepository.save(scheduleShiftTemplate);
    }

    @Override
    public void deleteShiftScheduleTemplates(Integer id) {
        scheduleShiftTemplateRepository.deleteById(id);
    }
}
