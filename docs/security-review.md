# Phase 9 security review

| Security issue | File affected | Risk | Proposed fix |
| --- | --- | --- | --- |
| Hard-coded JWT fallback secret | `server/src/config/jwt.js` | A leaked secret could allow attackers to forge valid tokens and bypass authentication. | Require a strong secret from the environment and fail startup if it is missing. |
| Unrestricted CORS origin | `server/src/server.js` | Browsers could accept cross-site requests from unknown origins, exposing authenticated APIs. | Restrict CORS to the configured frontend URL and localhost during development. |
| Missing security headers and auth rate limiting | `server/src/server.js` | Brute-force login attempts and missing HTTP security headers increase attack surface. | Add Helmet and request throttling for sensitive auth endpoints. |
| Generic API error path without central handling | `server/src/server.js` | Internal details may leak through inconsistent responses or unhandled exceptions. | Centralize error handling and return safe, consistent JSON responses. |
| Alert scheduler could duplicate in the same process | `server/src/modules/alerts/alertScheduler.js` | Multiple timers could create duplicate absenteeism checks and repeated alerts. | Guard scheduler startup so a single instance runs per server process. |
| Login messages were too revealing in wording | `server/src/controllers/authController.js` | Attackers can infer whether a username exists or whether credentials are wrong. | Return a generic login failure message for all invalid credentials. |
