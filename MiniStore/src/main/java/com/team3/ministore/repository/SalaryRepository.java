package com.team3.ministore.repository;

import com.team3.ministore.model.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Integer> {

    @Query("SELECT sl FROM Salary sl " +
            "WHERE sl.staff.staffId = :staffId " +
            "AND sl.effectiveDate <= CURRENT_DATE " +
            "AND sl.terminationDate IS NULL")
    Optional<Salary> findSalaryInformationByStaffId(Integer staffId);

    @Query("SELECT sl FROM Salary sl " +
            "WHERE sl.effectiveDate <= CURRENT_DATE " +
            "AND sl.terminationDate IS NULL")
    List<Salary> findSalaryOfAllStaffs();


}
