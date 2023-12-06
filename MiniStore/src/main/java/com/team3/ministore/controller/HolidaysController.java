package com.team3.ministore.controller;

import com.team3.ministore.common.responsehandler.ResponseHandler;
import com.team3.ministore.dto.HolidayDto;
import com.team3.ministore.service.HolidaysService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/holidays")
public class HolidaysController {
    @Autowired
    private HolidaysService holidaysService;

    @PostMapping("/add")
    public ResponseEntity<Object> createHolidays(@Valid @RequestBody HolidayDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        HolidayDto createdHoliday = holidaysService.createHolidays(dto);
        return ResponseHandler.getResponse(createdHoliday, HttpStatus.CREATED);
    }

    @GetMapping("/list")
    public ResponseEntity<Object> getAllHolidays(@RequestParam("search") Optional<String> search,
                                                 @RequestParam("curPage") Integer curPage,
                                                 @RequestParam("perPage") Integer perPage) {

        return search.map(s -> ResponseHandler.getResponse(holidaysService.getHolidays(s, curPage, perPage), HttpStatus.OK))
                .orElseGet(() -> ResponseHandler.getResponse(holidaysService.getHolidays(curPage, perPage), HttpStatus.OK));
    }

    @GetMapping("/all")
    public ResponseEntity<Object> getAllHolidays(@RequestParam("from") String from,
                                                 @RequestParam("to") String to) {

        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);

        return ResponseHandler.getResponse(holidaysService.getAllHolidays(fromDate, toDate), HttpStatus.OK);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Object> updateHolidays(@Valid @PathVariable("id") Integer id, @RequestBody HolidayDto dto, BindingResult errors) {
        if (errors.hasErrors()) return ResponseHandler.getResponse(errors, HttpStatus.BAD_REQUEST);

        Optional<HolidayDto> updatedHoliday = holidaysService.updateHolidays(id, dto);
        if (updatedHoliday.isEmpty())
            return ResponseHandler.getResponse(new Exception("Invalid holiday id"), HttpStatus.BAD_REQUEST);

        return ResponseHandler.getResponse(updatedHoliday, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Object> deleteHolidays(@PathVariable("id") Integer id) {
        holidaysService.deleteHolidays(id);
        return ResponseHandler.getResponse(HttpStatus.OK);
    }
}
