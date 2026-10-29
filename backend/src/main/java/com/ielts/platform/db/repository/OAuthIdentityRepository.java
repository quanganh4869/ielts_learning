package com.ielts.platform.db.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.ielts.platform.db.model.OAuthIdentityEntity;

@Repository
public interface OAuthIdentityRepository extends JpaRepository<OAuthIdentityEntity, String> {

    Optional<OAuthIdentityEntity> findByProviderAndProviderSubject(String provider, String providerSubject);

    Optional<OAuthIdentityEntity> findByUserIdAndProvider(String userId, String provider);

    boolean existsByProviderAndProviderSubject(String provider, String providerSubject);
}
