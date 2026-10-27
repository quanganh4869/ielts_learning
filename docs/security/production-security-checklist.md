# IELTS Learning Platform — Production Security Deployment Checklist

> **Classification**: Operations & DevSecOps Standard Operating Procedure (SOP)  
> **Target Environment**: Production / Staging Kubernetes or VPS Deployment  
> **Mandatory Review**: Must be verified and signed off before opening platform to real students and payment processing.

---

## 1. Secrets & Environment Configuration

- [ ] **No Hardcoded Secrets in Source Code or Git**:
  - Run `gitleaks detect --source . -v` before every release.
  - Verify that no `.env`, database credentials, Supabase service-role keys, or Cloudflare API tokens exist in version control.
- [ ] **Secret Manager Integration**:
  - Store all production credentials in AWS Secrets Manager, HashiCorp Vault, or Cloudflare Secrets.
  - Inject environment variables securely at container startup.
- [ ] **Admin Account Policy (`APP_ADMIN_EMAIL`)**:
  - Set `APP_ADMIN_EMAIL` strictly to authorized organization administrator emails (comma-separated).
  - Never allow wildcard emails (`*@domain.com`) or client-controlled role overrides.

---

## 2. HTTPS, TLS & Cookie Security

- [ ] **Enforce TLS 1.3 & HSTS**:
  - Web server / Reverse proxy (Cloudflare / Nginx / Traefik) must enforce HTTPS on all connections.
  - Enable HTTP Strict Transport Security: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- [ ] **Cookie Security Attribute (`APP_AUTH_COOKIE_SECURE`)**:
  - In production, set `APP_AUTH_COOKIE_SECURE=true`.
  - Guarantees the browser sends `access_token` and `refresh_token` cookies ONLY over encrypted HTTPS connections.
- [ ] **Cookie Scope Verification**:
  - `access_token`: `Path=/; HttpOnly; Secure; SameSite=Lax`.
  - `refresh_token`: `Path=/api/v1/auth; HttpOnly; Secure; SameSite=Lax`.
  - `XSRF-TOKEN`: `Path=/; Secure; SameSite=Lax` (non-HttpOnly for JavaScript double-submit header `X-XSRF-TOKEN`).

---

## 3. Database Security & Connection Isolation

- [ ] **PostgreSQL SSL Mode Required**:
  - Database connection string must enforce `sslmode=require` or `sslmode=verify-full`:  
    `jdbc:postgresql://<host>:5432/<db>?sslmode=require`
- [ ] **Least-Privilege Database Users**:
  - Application runtime connects with a dedicated database user with `SELECT, INSERT, UPDATE, DELETE` permissions.
  - Schema migrations run through Flyway with validate-only on production container launch (`spring.jpa.hibernate.ddl-auto=validate`).
- [ ] **Connection Pooling (HikariCP)**:
  - Connection pool capped appropriately (e.g., `maximum-pool-size: 20`, `idle-timeout: 300000`, `max-lifetime: 1200000`).

---

## 4. Cross-Origin Resource Sharing (CORS) & WAF

- [ ] **Strict CORS Allowed Origins**:
  - Replace wildcard origins with exact production domains:  
    `CORS_ALLOWED_ORIGINS=https://ielts.yourdomain.vn,https://admin.yourdomain.vn`
  - Never set `allowCredentials=true` with wildcard `*` origins.
- [ ] **Exposed & Allowed Headers**:
  - Allowed headers: `Authorization, Content-Type, Accept, X-XSRF-TOKEN, X-Requested-With, Origin`.
  - Exposed headers: `X-XSRF-TOKEN, Set-Cookie`.
- [ ] **Cloudflare WAF / DDoS Shield**:
  - Enable Cloudflare Managed WAF rules for OWASP Top 10 mitigation.
  - Enable Cloudflare Bot Fight Mode and rate-limiting rules on `/api/v1/auth/**` and `/api/v1/chat/**`.

---

## 5. Supabase Auth & JWT Verification

- [ ] **Asymmetric JWKS Verification**:
  - Production Spring Boot backend validates Supabase JWT signatures via official JWKS endpoint:  
    `SUPABASE_JWKS_URI=https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`
- [ ] **Audience & Issuer Claims Validation**:
  - Validate audience strictly matches `authenticated`.
  - Validate issuer strictly matches `https://<project-ref>.supabase.co/auth/v1`.
- [ ] **No Client-Side Service-Role Key**:
  - `SUPABASE_SECRET_KEY` (service-role key) must NEVER be exposed to frontend or bundled into Vite static assets.
  - Frontend uses only `VITE_SUPABASE_ANON_KEY` for client OAuth redirection.

---

## 6. Cloudflare R2 Storage Hardening

- [ ] **Private Bucket Configuration**:
  - R2 bucket must NOT have public listing enabled.
- [ ] **Presigned URL Expiry Windows**:
  - Direct upload presigned PUT URLs expire in 10 minutes (`R2_UPLOAD_TTL_SECONDS=600`).
  - Private file download presigned GET URLs expire in 15 minutes (`R2_DOWNLOAD_TTL_SECONDS=900`).
- [ ] **Strict MIME Type Validation**:
  - Backend validates file extensions and MIME types (`audio/mpeg, audio/wav, application/pdf, image/jpeg, image/png`) before issuing upload tickets.

---

## 7. HTTP Security Headers & Cache Control

- [ ] **Content Security Policy (CSP)**:
  - `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://<backend-domain> https://<supabase-domain>;`
- [ ] **Framing & Content Type Protection**:
  - `X-Frame-Options: DENY` (prevents clickjacking attacks).
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- [ ] **No-Store Cache on Authenticated Endpoints**:
  - `Cache-Control: no-cache, no-store, max-age=0, must-revalidate`.
  - `Pragma: no-cache`.

---

## 8. Rate Limiting, Audit Logging & Monitoring

- [ ] **AI Chatbot Rate Limiting**:
  - Chatbot endpoint rate-limited to 20 requests per minute per authenticated user to prevent API quota exhaustion and denial of wallet attacks.
- [ ] **Client IP Resolution Behind Proxies**:
  - When running behind Cloudflare or AWS ALB, set `APP_SECURITY_TRUSTED_PROXIES_ENABLED=true` and whitelist upstream CIDR ranges to ensure login events record genuine client IPs rather than proxy IPs.
- [ ] **Audit Trail Retention**:
  - Persist `login_events` and `admin_audit_logs` to persistent database storage with scheduled backup archiving.

---

## 9. Emergency Response & Key Rotation Procedure

1. **Compromised Secret / Key Leak**:
   - Immediately rotate `JWT_SECRET` / Supabase API keys in Supabase Dashboard.
   - Restart Spring Boot containers to pull fresh JWKS keys.
2. **Forced User Logout (Session Revocation)**:
   - Call `POST /api/v1/auth/logout` or invalidate sessions directly in `user_sessions` table (`UPDATE user_sessions SET active = false WHERE user_id = :userId`).
3. **Emergency Service Plan Lockdown**:
   - Use `/api/v1/admin/system-config` or environment switch to toggle maintenance mode if active intrusion is suspected.
