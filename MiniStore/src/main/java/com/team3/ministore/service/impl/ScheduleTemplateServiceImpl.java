package com.team3.ministore.service.impl;

import com.team3.ministore.dto.ScheduleShiftTemplateDto;
import com.team3.ministore.dto.ScheduleTemplateDto;
import com.team3.ministore.model.ScheduleShiftTemplate;
import com.team3.ministore.model.ScheduleTemplate;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.ScheduleTemplateRepository;
import com.team3.ministore.service.ScheduleShiftTemplateService;
import com.team3.ministore.service.ScheduleTemplateService;
import com.team3.ministore.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleTemplateServiceImpl implements ScheduleTemplateService {

    @Autowired
    private ScheduleTemplateRepository scheduleTemplateRepository;

    @Autowired
    private StaffService staffService;

    @Autowired
    private ScheduleShiftTemplateService scheduleShiftTemplateService;

    @Override
    public List<ScheduleTemplate> getAllScheduleTemplates() {
        return scheduleTemplateRepository.findAll();
    }

    @Override
    public ScheduleTemplateDto createScheduleTemplate(ScheduleTemplateDto dto) {
        // Create schedule template
        ScheduleTemplate scheduleTemplate = new ScheduleTemplate();

        scheduleTemplate.setName(dto.getName());
        scheduleTemplate.setDescription(dto.getDescription());
        scheduleTemplate.setNumOfShifts(dto.getScheduleShiftTemplates().size());

        scheduleTemplate.setScheduleShiftTemplates(new ArrayList<>());

        ScheduleTemplate createdScheduleTemplate = scheduleTemplateRepository.save(scheduleTemplate);
        ScheduleTemplateDto result = new ScheduleTemplateDto(createdScheduleTemplate);

        // ------------------------------------------------
        // Create shift schedule templates
        dto.getScheduleShiftTemplates().forEach(scheduleShiftTemplateDto -> {
            ScheduleShiftTemplate scheduleShiftTemplate = new ScheduleShiftTemplate();

            Optional<Staff> staff = staffService.getStaffById(scheduleShiftTemplateDto.getStaffId());
            if (staff.isEmpty()) return;

            scheduleShiftTemplate.setDate(scheduleShiftTemplateDto.getDate());
            scheduleShiftTemplate.setStartTime(scheduleShiftTemplateDto.getStartTime());
            scheduleShiftTemplate.setEndTime(scheduleShiftTemplateDto.getEndTime());
            scheduleShiftTemplate.setName(scheduleShiftTemplateDto.getName());
            scheduleShiftTemplate.setRole(scheduleShiftTemplateDto.getRole());
            scheduleShiftTemplate.setSalaryCoefficient(scheduleShiftTemplateDto.getSalaryCoefficient());
            scheduleShiftTemplate.setScheduleTemplate(createdScheduleTemplate);
            scheduleShiftTemplate.setStaff(staff.get());

            ScheduleShiftTemplateDto shift = new ScheduleShiftTemplateDto(
                    scheduleShiftTemplateService.createShiftScheduleTemplates(scheduleShiftTemplate)
            );

            // Add shift to schedule template
            result.getScheduleShiftTemplates().add(shift);
        });

        return result;
    }

    @Override
    public Optional<ScheduleTemplate> getScheduleTemplateById(Integer id) {
        return scheduleTemplateRepository.findById(id);
    }

    @Override
    public void deleteScheduleTemplate(Integer id) {
        scheduleTemplateRepository.deleteById(id);
    }
}
