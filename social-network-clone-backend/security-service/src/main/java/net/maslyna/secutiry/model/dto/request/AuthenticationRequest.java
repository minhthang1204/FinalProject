package net.maslyna.secutiry.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record AuthenticationRequest(
        @NotBlank @Email
        String email,
        @NotBlank @Size(min = 8, max = 100)
        String password
) {
}
