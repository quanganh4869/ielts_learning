package com.ielts.platform.admin.users.repository;

import com.ielts.platform.admin.users.model.OAuthIdentityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentityEntity, String> {

    Optional<OAuthIdentityEntity> findByProviderAndProviderSubject(String provider, String providerSubject);

    Optional<OAuthIdentityEntity> findByUserIdAndProvider(String userId, String provider);

    boolean existsByProviderAndProviderSubject(String provider, String providerSubject);
}
