package com.team3.ministore.repository;

import com.team3.ministore.model.Timesheet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Integer> {
    Page<Timesheet> findAllByShift_DateBetween(LocalDate from, LocalDate to, Pageable pageable);

    Page<Timesheet> findByStaff_StaffNameContainingIgnoreCaseAndShift_DateBetweenOrderByTimesheetIdDesc(String staff_staffName, LocalDate from, LocalDate to, Pageable pageable);
}
