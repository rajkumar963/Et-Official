# Build verification

Verified locally on 28 October 2026 with Node.js 22.12.0, npm 10.9.0, Next.js 16.3.6, Express 5 and an installed MongoDB server. Node.js 22.13+ is recommended because one transitive ESLint package declares that minimum.

| Check                                                           | Result                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| Production build of shared package, backend and frontend        | Passed                                                         |
| Strict TypeScript checks across all three workspaces            | Passed                                                         |
| ESLint                                                          | Passed                                                         |
| Prettier format check                                           | Passed                                                         |
| Backend analytics/schema tests and MongoDB integration workflow | 5 passed                                                       |
| Playwright core workflow and calendar mutation tests            | 4 passed: desktop Chromium and 375px mobile Chromium           |
| API readiness and database connection                           | HTTP 200, connected                                            |
| Landing page                                                    | HTTP 200                                                       |
| Root `npm run dev` starts both independent services             | Verified on ports 3000 and 4000                                |
| Visual review                                                   | Landing, overview, calendar, mobile overview screenshots saved |
| Browser runtime checks during screenshot capture                | No page errors; 375px viewport has no body overflow            |

The API workflow covers unauthorized requests, foreign-user reads/edits/deletes, disallowed write origins, invalid calendar dates, symbol normalization, month filtering, breakeven day aggregation, editable trade dates, baseline changes, refresh rotation, password login and captured-access-cookie revocation after logout. Tests create isolated users in the test database and remove those records.

The browser suite covers signup, create/edit/delete, 42 calendar cells, month navigation and Today, starting-balance updates, renewal after removing the access cookie, logout and unauthorized navigation. A separate browser workflow verifies a +200 day becomes green, another -200 trade makes it neutral, and deleting the winner makes it red. Native dialog dismissal with Escape is also exercised.

An early development-server test exposed competing navigation and refresh calls after sign-in. The auth transition now uses one replace navigation; journal loading also deduplicates concurrent requests and verifies/renews the session before parallel data reads. The expanded suite passed after these changes.

## Limits

- Google OAuth code is implemented, but an actual Google consent/callback round trip has not been tested because no client credentials were supplied. Email/password authentication is verified. Unconfigured Google sign-in returns to the login page with a useful message.
- Public hosting, a production MongoDB instance, TLS/reverse proxy settings, production cookies and deployment infrastructure were not configured or tested. This delivery is a local source project.
- Browser tests used Chromium, including mobile emulation; physical devices, Firefox and Safari were not tested.
- The Windows sandbox prevents the `tsx` runner from reading OS user information. API tests and development startup succeeded with approved execution outside that sandbox. The compiled backend also started normally inside the sandbox.
- E2E accounts are retained in the development database for debugging; created test trades are removed on successful runs. The demo account is separate and intentionally retains illustrative journal data.

## Screenshots

The screenshots captured during this verification were not retained in the repository.
