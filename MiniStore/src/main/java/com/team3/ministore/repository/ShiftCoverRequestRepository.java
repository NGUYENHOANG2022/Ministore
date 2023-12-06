package com.team3.ministore.repository;

import com.team3.ministore.model.ShiftCoverRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftCoverRequestRepository extends JpaRepository<ShiftCoverRequest, Integer> {
    @Query("SELECT sc FROM ShiftCoverRequest sc ORDER BY sc.shiftCoverRequestId DESC")
    Page<ShiftCoverRequest> findAll(Pageable pageable);

    @Query("SELECT scr FROM ShiftCoverRequest scr WHERE (:name is null OR LOWER(scr.staff.staffName) LIKE %:name% ) ORDER BY scr.shiftCoverRequestId DESC")
    Page<ShiftCoverRequest> findAllByFilter(String name, Pageable pageable);

    Page<ShiftCoverRequest> findAllByShift_Staff_StaffIdOrderByShiftCoverRequestIdDesc(Integer staffId, Pageable pageable);

    List<ShiftCoverRequest> findAllByStaff_StaffIdAndShift_DateBetween(int staff_staffId, LocalDate from, LocalDate to);
}
