package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.ScheduleShiftTemplateDto;
import com.team3.ministore.model.ScheduleShiftTemplate;
import com.team3.ministore.service.ScheduleShiftTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shift-schedule-templates")
public class ShiftScheduleTemplatesController {

    @Autowired
    private ScheduleShiftTemplateService scheduleShiftTemplateService;

    @GetMapping("")
    public ResponseEntity<List<ScheduleShiftTemplate>> getAllShiftScheduleTemplates() {
        List<ScheduleShiftTemplate> scheduleShiftTemplateList = scheduleShiftTemplateService.getAllShiftScheduleTemplates();
        return new ResponseEntity<>(scheduleShiftTemplateList, HttpStatus.OK);
    }

//    @PostMapping("/add")
//    public ResponseEntity<Object> createShiftScheduleTemplates(@RequestBody ScheduleShiftTemplateDto dto) {
//        ScheduleShiftTemplate createdScheduleShiftTemplate = scheduleShiftTemplateService.createShiftScheduleTemplates(dto);
//        return ResponseHandler.getResponse(new ScheduleShiftTemplateDto(createdScheduleShiftTemplate), HttpStatus.CREATED);
//    }

//    @PutMapping("/update/{id}")
//    public ResponseEntity<Object> updateShiftScheduleTemplates(@PathVariable("id") Integer id, @RequestBody ScheduleShiftTemplate scheduleShiftTemplate) {
//        Optional<ScheduleShiftTemplate> updatedScheduleShiftTemplate = scheduleShiftTemplateService.updateShiftScheduleTemplates(id, scheduleShiftTemplate);
//        return updatedScheduleShiftTemplate.map(value -> ResponseHandler.getResponse(value, HttpStatus.OK))
//                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Shift schedule template not found"), HttpStatus.NOT_FOUND));
//    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteShiftScheduleTemplates(@PathVariable("id") Integer id) {
        scheduleShiftTemplateService.deleteShiftScheduleTemplates(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
