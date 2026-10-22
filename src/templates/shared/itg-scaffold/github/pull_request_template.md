## Summary
What changed and why. ClickUp: <link>

## Target
- [ ] staging
- [ ] master (production) — requires QA sign-off on staging (a hotfix: the smoke test, §4.2)

## Checklist
- [ ] CI green (typecheck, lint, tests, build, route checks, knip)
- [ ] Configuration keys added or changed (if any) are in the right class (§2.1.3): Variables or Secrets added to both GitHub Environments, `.env.example` updated
- [ ] No secrets committed
- [ ] CHANGELOG.md updated
- [ ] New or changed routes emit audit / app events
- [ ] Old code path removed (no dead code left behind)
- [ ] Firestore rules / migrations updated for both environments (if any)
