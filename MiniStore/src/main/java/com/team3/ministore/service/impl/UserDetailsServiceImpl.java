package com.team3.ministore.service.impl;

import com.team3.ministore.dto.StaffDetails;
import com.team3.ministore.model.Staff;
import com.team3.ministore.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private StaffRepository staffRepository;

    public StaffDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Staff> staff = staffRepository.findByUsername(username);
        if (staff.isEmpty()) throw new UsernameNotFoundException("User not found");

        Set<GrantedAuthority> authorities = new HashSet<>();
        String roleName = staff.get().getRole().name();
        authorities.add(new SimpleGrantedAuthority(roleName));

        return new StaffDetails(username, staff.get().getPassword(), authorities);
    }

}
