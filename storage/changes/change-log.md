# Change Log

Record of change proposals managed with `/sdd-change-init`, `/sdd-change-apply` and
`/sdd-change-archive`. Archived changes live under `storage/archive/<year>/<change-id>/`.

| Change ID  | Name                                   | Status                                   | Date       | Description                                                                 | Result                                                                   |
| ---------- | -------------------------------------- | ---------------------------------------- | ---------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| CHANGE-001 | Multilingual publication support only  | ~~Approved~~ → ~~Implemented~~ → Archived | 2026-10-06 | Restrict multilingual support to technical-article creation and publication | ✅ commit `3987026`; records in `storage/archive/2026/CHANGE-001/` (unreleased) |
| CHANGE-002 | English only, no publication pipeline | ~~Proposed~~ → ~~Approved~~ → Implemented | 2026-10-07 | Remove the technical-article publication pipeline (generator, article sources, checklist) and make MUSUBI English only | implemented 2026-10-07; records in `storage/changes/` (commit hash at archive) |
