package com.team3.ministore.repository;

import com.team3.ministore.model.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {

    Optional<Staff> findByUsername(String username);

    Optional<Staff> findByEmail(String email);

    Page<Staff> findByStaffNameContainingIgnoreCaseOrderByStaffIdDesc(String staffName, Pageable pageable);

    List<Staff> findByStaffNameContainingIgnoreCaseOrderByStaffIdDesc(String staffName);

    @Query("SELECT s FROM Staff s ORDER BY s.staffId DESC")
    Page<Staff> findAll(Pageable pageable);

    @Query("SELECT s FROM Staff s ORDER BY s.staffId DESC")
    List<Staff> findAll();

    @Query("SELECT s FROM Staff s WHERE s.staffId = :staffId ORDER BY s.staffId DESC")
    Optional<Staff> findById(Integer staffId);

}
