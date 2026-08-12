package com.devflow.user.service;

import com.devflow.user.dto.UpdateUserPreferenceRequest;
import com.devflow.user.dto.UserPreferenceResponse;
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
public class UserPreferenceService {

    private static final Logger log = LoggerFactory.getLogger(UserPreferenceService.class);

    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserEventPublisher userEventPublisher;

    public UserPreferenceService(
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
    public UserPreferenceResponse getCurrentPreferences() {
        return userMapper.toPreferenceResponse(userService.requireCurrentActiveUser());
    }

    @Transactional
    public UserPreferenceResponse updateCurrentPreferences(UpdateUserPreferenceRequest request) {
        User user = userService.requireCurrentActiveUser();
        if (request.theme() != null && !request.theme().isBlank()) {
            user.setTheme(request.theme().trim());
        }
        if (request.notifyEmail() != null) {
            user.setNotifyEmail(request.notifyEmail());
        }
        if (request.notifyInApp() != null) {
            user.setNotifyInApp(request.notifyInApp());
        }
        User saved = userRepository.save(user);
        userEventPublisher.publish(UserEventType.USER_PREFERENCES_UPDATED, saved);
        log.info("eventType=USER_PREFERENCES_UPDATED userId={} result=ok", saved.getId());
        return userMapper.toPreferenceResponse(saved);
    }
}
