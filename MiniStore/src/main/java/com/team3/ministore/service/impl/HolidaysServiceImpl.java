package com.team3.ministore.service.impl;

import com.team3.ministore.dto.HolidayDto;
import com.team3.ministore.model.Holiday;
import com.team3.ministore.repository.HolidaysRepository;
import com.team3.ministore.service.HolidaysService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HolidaysServiceImpl implements HolidaysService {

    @Autowired
    private HolidaysRepository holidaysRepository;

    @Override
    public Page<HolidayDto> getHolidays(String search, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return holidaysRepository.findByNameContainingIgnoreCase(search, pageable).map(HolidayDto::new);
    }

    @Override
    public Page<HolidayDto> getHolidays(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        return holidaysRepository.findAll(pageable).map(HolidayDto::new);
    }

    @Override
    public HolidayDto createHolidays(HolidayDto dto) {
        Holiday nHoliday = new Holiday();
        nHoliday.setName(dto.getName());
        nHoliday.setStartDate(dto.getStartDate());
        nHoliday.setEndDate(dto.getEndDate());
        nHoliday.setCoefficient(dto.getCoefficient());

        return new HolidayDto(holidaysRepository.save(nHoliday));
    }

    @Override
    public Optional<HolidayDto> updateHolidays(Integer id, HolidayDto dto) {
        Optional<Holiday> existingHoliday = holidaysRepository.findById(id);

        if (existingHoliday.isEmpty()) return Optional.empty();

        existingHoliday.map(holiday -> {
            holiday.setName(dto.getName());
            holiday.setStartDate(dto.getStartDate());
            holiday.setEndDate(dto.getEndDate());
            holiday.setCoefficient(dto.getCoefficient());
            return holiday;
        });

        return Optional.of(new HolidayDto(holidaysRepository.save(existingHoliday.get())));
    }

    @Override
    public void deleteHolidays(Integer id) {
        holidaysRepository.deleteById(id);
    }

    @Override
    public List<HolidayDto> getAllHolidays(LocalDate startDate, LocalDate endDate) {
        return holidaysRepository.findAllByDates(startDate, endDate)
                .stream().map(HolidayDto::new).collect(Collectors.toList());
    }
}
