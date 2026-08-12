package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.organization.dto.AddMemberRequest;
import com.devflow.organization.dto.MembershipResponse;
import com.devflow.organization.dto.UpdateMemberRequest;
import com.devflow.organization.service.MembershipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/organizations/{organizationId}/members")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Memberships")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @GetMapping
    @Operation(summary = "List organization members")
    public ApiResponse<PageResponse<MembershipResponse>> list(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(membershipService.list(organizationId, page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add organization member")
    public ApiResponse<MembershipResponse> add(
            @PathVariable UUID organizationId,
            @Valid @RequestBody AddMemberRequest request
    ) {
        return ApiResponse.ok(membershipService.add(organizationId, request));
    }

    @PatchMapping("/{userId}")
    @Operation(summary = "Update member role or status")
    public ApiResponse<MembershipResponse> update(
            @PathVariable UUID organizationId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberRequest request
    ) {
        return ApiResponse.ok(membershipService.update(organizationId, userId, request));
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove organization member")
    public void remove(@PathVariable UUID organizationId, @PathVariable UUID userId) {
        membershipService.remove(organizationId, userId);
    }
}
