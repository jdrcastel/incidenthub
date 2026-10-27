package com.jdrcastel.incidenthub.ping;

import java.time.Instant;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Smallest possible endpoint: proves the app is up and shows the
 * controller -> JSON round trip before we add real tickets.
 */
@RestController
@RequestMapping("/api/ping")
public class PingController {

    @GetMapping
    public PingResponse ping() {
        return new PingResponse("pong", Instant.now());
    }

    /** A record is an immutable data class; Spring turns it into JSON. */
    public record PingResponse(String message, Instant time) {
    }
}
