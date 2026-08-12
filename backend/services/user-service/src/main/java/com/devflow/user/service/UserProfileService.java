package com.devflow.user.service;

import com.devflow.user.dto.UpdateUserProfileRequest;
import com.devflow.user.dto.UserProfileResponse;
import com.devflow.user.entity.User;
import com.devflow.user.events.UserEventPublisher;
import com.devflow.user.events.UserEventType;
import com.devflow.user.mapper.UserMapper;
import com.devflow.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserEventPublisher userEventPublisher;

    public UserProfileService(
            UserService userService,
            UserRepository userRepository,
            UserMapper userMapper,
            UserEventPublisher userEventPublisher
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.userEventPublisher = userEventPublisher;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentProfile() {
        return userMapper.toProfileResponse(userService.requireCurrentActiveUser());
    }

    @Transactional
    public UserProfileResponse updateCurrentProfile(UpdateUserProfileRequest request) {
        User user = userService.requireCurrentActiveUser();
        if (request.firstName() != null) {
            user.setFirstName(blankToNull(request.firstName()));
        }
        if (request.lastName() != null) {
            user.setLastName(blankToNull(request.lastName()));
        }
        if (request.displayName() != null) {
            user.setDisplayName(blankToNull(request.displayName()));
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(blankToNull(request.avatarUrl()));
        }
        if (request.timezone() != null) {
            user.setTimezone(blankToNull(request.timezone()));
        }
        if (request.locale() != null) {
            user.setLocale(blankToNull(request.locale()));
        }
        User saved = userRepository.save(user);
        userEventPublisher.publish(UserEventType.USER_UPDATED, saved);
        log.info("eventType=USER_UPDATED userId={} result=profile_updated", saved.getId());
        return userMapper.toProfileResponse(saved);
    }

    private static String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
