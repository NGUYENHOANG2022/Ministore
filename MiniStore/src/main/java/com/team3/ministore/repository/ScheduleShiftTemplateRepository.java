package com.team3.ministore.repository;

import com.team3.ministore.model.ScheduleShiftTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleShiftTemplateRepository extends JpaRepository<ScheduleShiftTemplate, Integer> {
}
