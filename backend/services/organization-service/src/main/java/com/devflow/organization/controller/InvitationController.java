package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.organization.dto.CreateInvitationRequest;
import com.devflow.organization.dto.InvitationResponse;
import com.devflow.organization.dto.MembershipResponse;
import com.devflow.organization.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@PreAuthorize("isAuthenticated()")
@Tag(name = "Invitations")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/api/organizations/{organizationId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create invitation (raw token returned once)")
    public ApiResponse<InvitationResponse> create(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateInvitationRequest request
    ) {
        return ApiResponse.ok(invitationService.create(organizationId, request));
    }

    @GetMapping("/api/organizations/{organizationId}/invitations")
    @Operation(summary = "List invitations")
    public ApiResponse<PageResponse<InvitationResponse>> list(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(invitationService.list(organizationId, page, size));
    }

    @DeleteMapping("/api/invitations/{invitationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoke invitation")
    public void revoke(@PathVariable UUID invitationId) {
        invitationService.revoke(invitationId);
    }

    @PostMapping("/api/invitations/{token}/accept")
    @Operation(summary = "Accept invitation by token")
    public ApiResponse<MembershipResponse> accept(@PathVariable String token) {
        return ApiResponse.ok(invitationService.accept(token));
    }
}
