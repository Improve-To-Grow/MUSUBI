# Feedback for the ITG Software Delivery Playbook

Points where this fork does what the playbook v2.2 or the ITG Project Setup Guide v2.2 does not say, or says differently, collected for the playbook maintainers. The fork's policies follow the playbook once it decides. Remove an item when the playbook covers it.

| # | Where | What the fork does | Why | Source |
|---|---|---|---|---|
| 1 | Playbook §3.3, §5.4 | Spec paths are `storage/specs/<feature>-requirements.md`, `storage/design/<feature>-design.md`, `storage/tasks/<feature>-tasks.md` and `storage/traceability/matrix.md` | These are the files MUSUBI writes; v2.2 named folder paths. The correction is in the playbook repository's working copy but not committed there yet | CHANGE-007 |
| 2 | Playbook §2.1.3, C.1 | The Functions deploy job authenticates with `FIREBASE_DEPLOY_SERVICE_ACCOUNT` | The Setup Guide uses it; the playbook does not name it | CHANGE-008 |
| 3 | Playbook §8.2.1, C.2 | Workers are deployed with `npx wrangler deploy` and one `--var` per value, not `cloudflare/wrangler-action` | Server configuration values can contain spaces (`EMAIL_SENDER_NAME`), which one action command string splits | CHANGE-008 |
| 4 | Playbook §9.1, C.3 | The route event catalogue is `src/lib/logs/route-events.ts` | `check-route-logging` needs a file; the playbook does not name one | CHANGE-008 |
| 5 | Playbook §8.1, Setup Guide §11 | The constitution check is `musubi-validate project` and `musubi-trace ci-check`, after `musubi-trace matrix` | `musubi validate` prints a checklist and always exits 0 | CHANGE-009 |
| 6 | Playbook §2.2.1, Setup Guide §10.2 | No `postinstall` jose patch | The patch removes the `workerd` export condition of jose 5; jose 6 no longer has it, and `opennextjs-cloudflare build` succeeds with jose 6.2.13 without the patch (tested 2026-10-26). Projects on jose 5 (`diversity`, `ebc`) still need it | CHANGE-012 |
