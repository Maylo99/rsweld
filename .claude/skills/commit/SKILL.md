---
name: commit
description: Create a git commit for the RSweld repo following its conventions. Use when the user asks to commit, "commit this", "make a commit", or after finishing a unit of work they want saved. Handles Conventional Commits format, the Co-Authored-By trailer, pre-commit checks, and never staging secrets or generated files.
---

# commit

Create a clean git commit for RSweld.

## Preconditions — run these first, do not skip

1. `git status` and `git diff` (staged + unstaged) to see exactly what changed.
   Read the diff; the commit message must describe what actually changed, not
   what you intended.
2. Verify quality gates pass (Node 22 must be active — see `CLAUDE.md`):
   ```bash
   pnpm lint && pnpm build && pnpm format:check
   ```
   If any fail, fix or report — do NOT commit a broken tree.
3. If on `main`, create a branch first (`git switch -c <type>/<short-desc>`)
   unless the user explicitly said to commit to main.

## What must NEVER be staged

- `.env` or any `.env.*` **except** `.env.example`
- `lib/generated/` (regenerated Prisma client)
- `node_modules/`, `.next/`
  Confirm with `git status --porcelain | grep -E '\.env$|lib/generated'` → must be empty.

## Message format — Conventional Commits

```
<type>(<optional scope>): <imperative summary, ≤72 chars>

<body: what & why, wrapped ~72 cols. Optional for tiny changes.>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

- **types**: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`, `perf`, `build`, `ci`
- Summary in imperative mood ("add", not "added"). Lowercase after the colon.
- Slovak or English body both fine; match the surrounding history.
- One logical change per commit. If the diff spans unrelated concerns, stage
  selectively (`git add -p`) and make multiple commits.
- Always end with the `Co-Authored-By` trailer above.

## Steps

1. Stage intentionally (`git add <paths>` or `git add -p`), not blind `git add -A`
   unless the whole tree is one change.
2. Re-check nothing forbidden is staged (see above).
3. Commit with a heredoc so the body/trailer format survives:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat(kontakt): wire contact form to /api/inquiries

   <body>

   Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```
4. `git log --oneline -1` and `git status` to confirm a clean result.

Only push if the user asks.
