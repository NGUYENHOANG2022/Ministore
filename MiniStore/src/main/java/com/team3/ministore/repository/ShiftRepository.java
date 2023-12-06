package com.team3.ministore.repository;

import com.team3.ministore.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Integer> {
    List<Shift> findAllByStaff_StaffIdAndDateBetween(int staffId, LocalDate from, LocalDate to);
    List<Shift> findAllByDateBetween(LocalDate from, LocalDate to);
}
