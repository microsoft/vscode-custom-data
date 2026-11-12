---
name: update-web-custom-data
description: Refresh web custom data, fill missing MDN docs, bump the version, fix audit findings, validate, and open a PR.
---

# Update web custom data

Run npm commands from `web-data`. If there are uncommitted changes, inform the user before proceeding.

1. Create a new branch off origin/main
2. Run `npm run update-sources`, then `npm run generate-data`.
3. Fill missing documentation in `css/mdn/mdn-documentation.mjs` using verified
   [MDN pages](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference).
   Match neighboring descriptions: concise plain text, no MDN macros.
   The automatic lookup may miss moved pages. Leave unavailable docs flagged; do not invent them.
4. Bump `package.json` by one **patch** version unless requested otherwise.
   Run `npm i`, `npm audit fix` (no `--force`), then `npm audit`.
5. Run `npm test`. Verify matching manifest/lockfile
   versions match between the manifest and the lockfile.
6. Review intended changes and run `git diff --check`. Commit only release files,
   respecting signing.
7. Push and create a PR using the actual version in its title. Summarize changes,
   validation, and remaining documentation/audit gaps. Return the commit and PR link.

Stop on failed commands. Do not publish the package or merge the PR.
