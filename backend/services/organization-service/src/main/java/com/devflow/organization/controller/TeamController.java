package com.devflow.organization.controller;

import com.devflow.common.api.ApiResponse;
import com.devflow.common.dto.PageResponse;
import com.devflow.organization.dto.AddTeamMemberRequest;
import com.devflow.organization.dto.CreateTeamRequest;
import com.devflow.organization.dto.TeamMembershipResponse;
import com.devflow.organization.dto.TeamResponse;
import com.devflow.organization.dto.UpdateTeamRequest;
import com.devflow.organization.service.TeamService;
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
@PreAuthorize("isAuthenticated()")
@Tag(name = "Teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping("/api/organizations/{organizationId}/teams")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create team")
    public ApiResponse<TeamResponse> create(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateTeamRequest request
    ) {
        return ApiResponse.ok(teamService.create(organizationId, request));
    }

    @GetMapping("/api/organizations/{organizationId}/teams")
    @Operation(summary = "List teams in organization")
    public ApiResponse<PageResponse<TeamResponse>> listByOrganization(
            @PathVariable UUID organizationId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(teamService.listByOrganization(organizationId, page, size));
    }

    @GetMapping("/api/teams/{teamId}")
    @Operation(summary = "Get team")
    public ApiResponse<TeamResponse> get(@PathVariable UUID teamId) {
        return ApiResponse.ok(teamService.get(teamId));
    }

    @PatchMapping("/api/teams/{teamId}")
    @Operation(summary = "Update team")
    public ApiResponse<TeamResponse> update(
            @PathVariable UUID teamId,
            @Valid @RequestBody UpdateTeamRequest request
    ) {
        return ApiResponse.ok(teamService.update(teamId, request));
    }

    @DeleteMapping("/api/teams/{teamId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete team")
    public void delete(@PathVariable UUID teamId) {
        teamService.delete(teamId);
    }

    @GetMapping("/api/teams/{teamId}/members")
    @Operation(summary = "List team members")
    public ApiResponse<PageResponse<TeamMembershipResponse>> listMembers(
            @PathVariable UUID teamId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        return ApiResponse.ok(teamService.listMembers(teamId, page, size));
    }

    @PostMapping("/api/teams/{teamId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add team member")
    public ApiResponse<TeamMembershipResponse> addMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody AddTeamMemberRequest request
    ) {
        return ApiResponse.ok(teamService.addMember(teamId, request));
    }

    @DeleteMapping("/api/teams/{teamId}/members/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove team member")
    public void removeMember(@PathVariable UUID teamId, @PathVariable UUID userId) {
        teamService.removeMember(teamId, userId);
    }
}
