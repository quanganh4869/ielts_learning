package com.ielts.platform.schemas.system;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingRequest {

    @NotNull(message = "Setting value cannot be null")
    @Size(max = 4000, message = "Setting value cannot exceed 4000 characters")
    private String value;
}
