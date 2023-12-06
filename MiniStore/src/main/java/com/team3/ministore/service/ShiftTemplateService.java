package com.team3.ministore.service;

import com.team3.ministore.dto.CreateShiftTemplateDto;
import com.team3.ministore.model.ShiftTemplate;

import java.util.List;
import java.util.Optional;

public interface ShiftTemplateService {
    List<ShiftTemplate> getAllShiftTemplates();

    ShiftTemplate createShiftTemplate(CreateShiftTemplateDto dto);

    Optional<ShiftTemplate> getShiftTemplatesById(Integer id);

    Optional<ShiftTemplate> updateShiftTemplates(Integer id, CreateShiftTemplateDto dto);

    void deleteShiftTemplates(Integer id);
}

