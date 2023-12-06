package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.CreateShiftTemplateDto;
import com.team3.ministore.model.ShiftTemplate;
import com.team3.ministore.service.ShiftTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/shift-templates")
public class ShiftTemplateController {

    @Autowired
    private ShiftTemplateService shiftTemplateService;

    @GetMapping()
    public ResponseEntity<Object> getAllShiftTemplates() {
        return ResponseHandler.getResponse(shiftTemplateService.getAllShiftTemplates(), HttpStatus.OK);
    }

    @PostMapping("/add")
    public ResponseEntity<Object> createShiftTemplates(@Valid @RequestBody CreateShiftTemplateDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        ShiftTemplate createdShiftTemplate = shiftTemplateService.createShiftTemplate(dto);
        return ResponseHandler.getResponse(createdShiftTemplate, HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateShiftTemplate(@Valid @PathVariable("id") Integer id,
                                                      @RequestBody CreateShiftTemplateDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<ShiftTemplate> updatedShiftTemplate = shiftTemplateService.updateShiftTemplates(id, dto);
        return updatedShiftTemplate.map(value -> ResponseHandler.getResponse(value, HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(new Exception("Shift template not found"), HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteShiftTemplates(@PathVariable("id") Integer id) {
        shiftTemplateService.deleteShiftTemplates(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }
}
