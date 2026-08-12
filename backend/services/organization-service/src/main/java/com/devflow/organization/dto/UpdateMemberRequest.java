package com.devflow.organization.dto;

import com.devflow.organization.enums.MembershipStatus;
import jakarta.validation.constraints.Size;

public record UpdateMemberRequest(
        @Size(max = 64) String roleCode,
        MembershipStatus status
) {
}
