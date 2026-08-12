package com.devflow.project.service;

import com.devflow.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
public class SlugService {

    private final ProjectRepository projectRepository;

    public SlugService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public String uniqueSlug(UUID organizationId, String name) {
        String base = toSlug(name);
        if (base.isBlank()) {
            base = "project";
        }
        if (base.length() > 160) {
            base = base.substring(0, 160);
        }
        String candidate = base;
        int suffix = 2;
        while (projectRepository.existsByOrganizationIdAndSlugIgnoreCase(organizationId, candidate)) {
            String suffixPart = "-" + suffix;
            int maxBase = Math.max(1, 180 - suffixPart.length());
            String truncated = base.length() > maxBase ? base.substring(0, maxBase) : base;
            candidate = truncated + suffixPart;
            suffix++;
        }
        return candidate;
    }

    static String toSlug(String name) {
        if (name == null) {
            return "";
        }
        String slug = name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug;
    }
}
