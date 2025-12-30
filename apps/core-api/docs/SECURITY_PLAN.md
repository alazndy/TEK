# Security & Infrastructure Plan

## 1. Web Application Firewall (WAF)

We recommend using **Cloudflare** as the primary WAF and CDN provider.

### Configuration Strategy

- **Zone Level**: Enable WAF for the entire domain (`*.t-ecosystem.com`).
- **Managed Rules**: Enable "Cloudflare Managed Ruleset" to block common attacks (SQLi, XSS).
- **OWASP Core Ruleset**: Enable with "Kinda Strict" sensitivity.
- **Bot Fight Mode**: Enable to challenge automated bots.

## 2. Rate Limiting (Infrastructure Level)

While the application has application-level rate limiting (`ThrottlerModule`), infrastructure-level limiting provides better DDoS protection.

**Cloudflare Rate Limiting Rules:**

- **Login Endpoint**: Limit `POST /auth/login` to 5 requests per minute per IP.
- **API General**: Limit `/api/*` to 1000 requests per 5 minutes per IP.
- **Action**: Block for 15 minutes upon violation.

## 3. DDoS Protection

- **Under Attack Mode**: Enable manually during active attacks.
- **Browser Integrity Check**: Enabled.
- **User Agent Blocking**: Block empty or suspicious User-Agents.

## 4. SSL/TLS

- **Mode**: Full (Strict). Ensures encryption between Cloudflare and the Origin Server.
- **HSTS**: Enable with 6 months duration, include subdomains, and preload.
- **Minimum TLS Version**: 1.2.

## 5. Application Hardening Checklist

- [x] **Helmet Headers**: Configured in `main.ts` (CSP, HSTS, X-Frame-Options).
- [x] **Input Validation**: Global `ValidationPipe` with strict whitelisting.
- [ ] **Data Sanitization**: Sanitize inputs to prevent NoSQL injection (using `mongo-sanitize` if applicable, or TypeORM parameterization).
- [ ] **Audit Logs**: Track sensitive actions (Login, Role Change, Deletion).
