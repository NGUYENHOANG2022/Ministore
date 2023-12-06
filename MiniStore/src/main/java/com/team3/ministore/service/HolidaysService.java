package com.team3.ministore.service;

import com.team3.ministore.dto.HolidayDto;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidaysService {
    Page<HolidayDto> getHolidays(String search, int page, int pageSize);

    Page<HolidayDto> getHolidays(int page, int pageSize);

    HolidayDto createHolidays(HolidayDto holiday);

    Optional<HolidayDto> updateHolidays(Integer id, HolidayDto dto);

    void deleteHolidays(Integer id);

    List<HolidayDto> getAllHolidays(LocalDate startDate, LocalDate endDate);
}
