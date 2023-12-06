package com.team3.ministore.repository;

import com.team3.ministore.model.Holiday;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidaysRepository extends JpaRepository<Holiday, Integer> {
    Page<Holiday> findByNameContainingIgnoreCase(String name,Pageable pageable);

    @Query("SELECT h FROM Holiday h " +
            "WHERE ((h.startDate BETWEEN :startDate AND :endDate) OR (h.endDate BETWEEN :startDate AND :endDate) " +
            "OR (h.startDate <= :startDate AND h.endDate >= :endDate))")
    List<Holiday> findAllByDates(LocalDate startDate, LocalDate endDate);
}
