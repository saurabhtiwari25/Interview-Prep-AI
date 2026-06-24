package com.interview.backend.controller;

import com.interview.backend.exception.BadRequestException;
import com.interview.backend.exception.UnauthorizedException;
import com.interview.backend.model.User;
import com.interview.backend.security.JwtUtil;
import com.interview.backend.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import com.interview.backend.dto.AuthRequest;
import com.interview.backend.dto.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

    private final UserDetailsService userDetailsService;
    
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        log.info("Registration request received for email: {}", user.getEmail());
        User savedUser = authService.registerUser(user);
        log.info("User registered successfully with id: {}", savedUser.getId());
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> createAuthenticationToken(@RequestBody AuthRequest authRequest) {
        String email = authRequest.email();
        log.info("Login attempt for email: {}", email);

        if (email == null || authRequest.password() == null) {
            throw new BadRequestException("Email and password are required.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, authRequest.password())
            );
        } catch (Exception e) {
            log.warn("Failed login attempt for email: {}", email);
            throw new UnauthorizedException("Incorrect username or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        final String jwt = jwtUtil.generateToken(userDetails);

        log.info("Login successful for email: {}", email);
        return ResponseEntity.ok(new AuthResponse(jwt, userDetails.getUsername()));
    }
}
