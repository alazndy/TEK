# Production Launch Checklist

## 1. Environment Configuration

- [ ] **Environment Variables**:
  - `NODE_ENV=production`
  - `JWT_SECRET` (Strong random string)
  - `DATABASE_URL` (Production endpoint)
  - `REDIS_URL` (Production endpoint)
  - `STRIPE_SECRET_KEY` (Live key)

## 2. Infrastructure

- [ ] **Cloud Run**:
  - [ ] CPU/Memory limits configured (Min 1CPU, 512MB).
  - [ ] Auto-scaling enabled (Min 1, Max 10).
- [ ] **Database**:
  - [ ] Point-in-time recovery enabled.
  - [ ] Connection pooling (PgBouncer) configured.
- [ ] **CDN/WAF**:
  - [ ] Cloudflare proxied DNS.
  - [ ] SSL Mode set to Full (Strict).

## 3. Application Checks

- [ ] **Database Migrations**: Run `prisma migrate deploy` (if applicable) or sync schemas.
- [ ] **Seed Data**: Ensure initial roles and admin user exist.
- [ ] **Health Check**: Verify `/health` or root endpoint returns 200.

## 4. Third-Party Integrations

- [ ] **Stripe**:
  - [ ] Webhook endpoint configured (`/api/marketplace/webhooks`).
  - [ ] Switch client-side keys to Live mode.
- [ ] **Firebase**:
  - [ ] Production project keys added.
  - [ ] Authorized domains updated.

## 5. Monitoring & Alerting

- [ ] **Sentry**: DSN configured and source maps uploaded.
- [ ] **Uptime Robot**: Monitor API health endpoint.
- [ ] **Logging**: Structured JSON logging enabled.

## 6. Post-Launch

- [ ] **Smoke Test**: Manual critical path testing (Signup -> Purchase).
- [ ] **Backup Verification**: Verify first night's backup.
