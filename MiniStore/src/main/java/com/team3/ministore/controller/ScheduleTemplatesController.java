package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.ScheduleTemplateDto;
import com.team3.ministore.model.ScheduleTemplate;
import com.team3.ministore.service.ScheduleTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/schedule-templates")
public class ScheduleTemplatesController {

    @Autowired
    private ScheduleTemplateService scheduleTemplateService;

    @GetMapping("/list")
    public ResponseEntity<Object> getAllScheduleTemplates() {
        List<ScheduleTemplateDto> scheduleTemplateList = scheduleTemplateService.getAllScheduleTemplates()
                .stream().map(st -> new ScheduleTemplateDto(st, false)).collect(Collectors.toList());

        return ResponseHandler.getResponse(scheduleTemplateList, HttpStatus.OK);
    }

    @GetMapping("/list/{id}")
    public ResponseEntity<Object> getScheduleTemplate(@PathVariable("id") Integer id) {
        Optional<ScheduleTemplate> scheduleTemplateList = scheduleTemplateService.getScheduleTemplateById(id);

        return scheduleTemplateList.map(scheduleTemplate -> ResponseHandler.getResponse(new ScheduleTemplateDto(scheduleTemplate), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Schedule template not found"), HttpStatus.NOT_FOUND));
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createScheduleTemplate(@Valid @RequestBody ScheduleTemplateDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        ScheduleTemplateDto createdScheduleTemplate = scheduleTemplateService.createScheduleTemplate(dto);

        return ResponseHandler.getResponse(createdScheduleTemplate, HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteScheduleTemplate(@PathVariable("id") Integer id) {
        scheduleTemplateService.deleteScheduleTemplate(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }
}
