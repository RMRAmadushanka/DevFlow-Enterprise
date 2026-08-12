package com.devflow.user.repository;

import com.devflow.user.entity.User;
import com.devflow.user.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByExternalIdentityId(String externalIdentityId);

    Optional<User> findByExternalIdentityIdAndStatusNot(String externalIdentityId, UserStatus status);

    Optional<User> findByEmailIgnoreCaseAndStatusNot(String email, UserStatus status);

    Optional<User> findByIdAndStatusNot(UUID id, UserStatus status);

    boolean existsByExternalIdentityId(String externalIdentityId);
}
