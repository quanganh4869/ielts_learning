package com.ielts.platform.security;

import com.ielts.platform.admin.users.model.UserEntity;
import com.ielts.platform.admin.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Set<GrantedAuthority> authorities = new HashSet<>();
        user.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase().replace(" ", "_")));
            role.getPermissions().forEach(permission ->
                authorities.add(new SimpleGrantedAuthority(permission.getCode()))
            );
        });

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .password(user.getPasswordHash())
                .active(user.getStatus() == UserEntity.UserStatus.ACTIVE)
                .authorities(authorities)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(String id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        Set<GrantedAuthority> authorities = new HashSet<>();
        user.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase().replace(" ", "_")));
            role.getPermissions().forEach(permission ->
                authorities.add(new SimpleGrantedAuthority(permission.getCode()))
            );
        });

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .password(user.getPasswordHash())
                .active(user.getStatus() == UserEntity.UserStatus.ACTIVE)
                .authorities(authorities)
                .build();
    }
}
