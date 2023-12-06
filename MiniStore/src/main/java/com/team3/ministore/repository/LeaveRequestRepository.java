package com.team3.ministore.repository;

import com.team3.ministore.model.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {

    @Query("SELECT l FROM LeaveRequest l WHERE l.staff.staffId = :id AND " +
            "((l.startDate BETWEEN :startDate AND :endDate) OR (l.endDate BETWEEN :startDate AND :endDate) " +
            "OR (l.startDate <= :startDate AND l.endDate >= :endDate))")
    List<LeaveRequest> findLeaveRequestsByStaffIdAndDates(Integer id, LocalDate startDate, LocalDate endDate);

    @Query("SELECT l FROM LeaveRequest l ORDER BY l.leaveRequestId DESC")
    Page<LeaveRequest> findAll(Pageable pageable);

    @Query("SELECT lr FROM LeaveRequest lr WHERE (:name is null OR LOWER(lr.staff.staffName) LIKE %:name% ) ORDER BY lr.leaveRequestId DESC")
    Page<LeaveRequest> findAllByFilter(String name, Pageable pageable);

    Page<LeaveRequest> findAllByStaff_StaffIdOrderByLeaveRequestIdDesc(Integer staffId, Pageable pageable);
}
