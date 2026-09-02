package com.devflow.sprint.mapper;

import com.devflow.sprint.dto.ReleaseResponse;
import com.devflow.sprint.entity.Release;
import com.devflow.sprint.entity.ReleaseStatus;
import com.devflow.sprint.exception.SprintValidationException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
public class ReleaseMapper {

    private static final Logger log = LoggerFactory.getLogger(ReleaseMapper.class);
    private static final TypeReference<List<String>> FEATURES_TYPE = new TypeReference<>() {
    };

    private final ObjectMapper objectMapper;

    public ReleaseMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ReleaseStatus toStatus(String raw) {
        if (raw == null || raw.isBlank()) return ReleaseStatus.PLANNED;
        try {
            return ReleaseStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new SprintValidationException("Invalid release status: " + raw);
        }
    }

    /** Lowercased wire format, matching SprintMapper.toUiStatus's convention for status/health fields. */
    public String toUiStatus(ReleaseStatus status) {
        return status.name().toLowerCase(Locale.ROOT);
    }

    /**
     * {@code Release.featuresJson} is stored as a raw TEXT column (a JSON-encoded string array),
     * but the API exposes it as a plain {@code List<String>} so callers never have to parse JSON
     * themselves. {@code null}/blank storage maps to an empty list.
     */
    public List<String> toFeatures(String featuresJson) {
        if (featuresJson == null || featuresJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(featuresJson, FEATURES_TYPE);
        } catch (JsonProcessingException ex) {
            log.warn("result=features_json_parse_failed reason={}", ex.getMessage());
            return List.of();
        }
    }

    public String toFeaturesJson(List<String> features) {
        if (features == null || features.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(features);
        } catch (JsonProcessingException ex) {
            throw new SprintValidationException("Invalid features list");
        }
    }

    public ReleaseResponse toResponse(Release release) {
        return new ReleaseResponse(
                release.getId(),
                release.getProjectId(),
                release.getOrganizationId(),
                release.getName(),
                release.getVersion(),
                release.getDescription(),
                release.getStatus() != null ? toUiStatus(release.getStatus()) : null,
                release.getReleaseDate(),
                toFeatures(release.getFeaturesJson()),
                release.getCreatedAt(),
                release.getUpdatedAt()
        );
    }
}
