---
name: worker-sync
description: Sync, deprecate, or audit the feature route map; only archive when the user explicitly requests organizing and archiving. Triggered when core features are added or removed, feature entries change, core implementations migrate, critical test entry points change, or when the user requests checking if the route map is outdated.
---

# Route Sync

Keep the feature route map consistent with current code location information. Only modify the document when location information changes are confirmed; if changes are confirmed but some fields are unknown, only update confirmed information and mark unknown fields as `uncertain`.

## Core Principles

- The feature route map is not a complete code index or feature knowledge base; it only records the most valuable locations to read first when modifying a feature next time.
- Actual code changes take priority over planning documents.
- Information that cannot be confirmed should be written as `uncertain` or simply omitted — never fabricate.
- By default, only modify related entries; do not rewrite the entire route map for style consistency.
- If route map structure affects current task location lookup, local structural adjustments are allowed: supplement the `Module Index`, place related entries under the corresponding module, or add module-to-file mappings in directory mode; do not rewrite unrelated entries for style consistency.
- By default, only modify WorkerHelper documents, not business code.

## When to Check

Route-sync must be checked in the following cases, and the route map should only be modified when the current task confirms that location information has changed:

- Core features added or removed.
- Feature entry file changed.
- Core implementation file migrated.
- Critical test entry added, removed, migrated, or renamed.
- Route map clearly outdated.
- Route map missing module hierarchy, causing the current task to be unable to locate through modules or entries stably.

The following cases typically only need to explain why no modification is needed: internal implementation detail adjustments, formatting, comments, general copy, logging, small refactoring that doesn't change location paths, and adding tests without affecting critical test entry points.

## Workflow

1. Read the feature route map: default `docs/workerhelper/feature-routes.md` or `docs/workerhelper/feature-routes/`.
2. Collect current task information: actual changed files, `git diff`, test results, execution summary, `plan.md`, `design.md`, user explanation.
   - If implementation is incomplete or verification has failed, only sync confirmed location changes; when unverified paths exist, they must be marked as `uncertain` — do not output a definite "updated".
3. Determine whether modification is needed:
   - Not needed: output the reason, do not modify files.
   - Needed: update existing feature location entries, or add new feature location entries.
   - Uncertain whether changes occurred: do not modify files, only output unconfirmed content.
   - Confirmed changes but some fields unknown: update confirmed information, mark unknown fields as `uncertain`.
4. Handle deprecated or removed features:
   - Feature still exists but is not recommended: note in the remarks that it is deprecated.
   - Feature has been deleted or replaced: delete or move the related location entry; when retention is needed, only record the original entry and replacement feature.
   - Only move to `feature-routes-archive.md` when the user explicitly requests organizing and archiving.
5. Modification content should maintain consistency with existing route map entry format; if structural adjustments are needed, update related areas according to `worker-init`'s "Project Overview → Module Index → Module → Feature" structure.
6. During structural adjustments, only process modules and features confirmed as related to the current task; entries with unconfirmed ownership are marked as `uncertain` or kept in place.
7. Output sync summary.

## Output Format

```md
# Route Sync Summary

## Result
- Updated / No update needed / partial / uncertain

## Added Feature Routes
- None / ...

## Modified Feature Routes
- None / ...

## Deprecated or Removed
- None / ...

## File Location Changes
- None / ...

## Structural Adjustments
- None / Added module index / Entries moved into module / Directory index updated / ...

## Unconfirmed Content
- None / ...

## Follow-up Recommendations
- None / Recommend manual confirmation / Recommend running worker-sync audit mode again ...
```

## Audit Mode

When the user requests checking whether the route map is outdated, perform a lightweight audit first. By default, only check modules related to the current task; only check all feature location entries one by one when the user explicitly requests a comprehensive audit or full check:

1. Whether files referenced in `Core` exist.
2. Whether the locations described in `Entry` still match the code.
3. Whether files referenced in `Tests` exist and are still the critical test or verification entry points for that feature.
4. Whether any critical test entry migrations, renames, or deletions have occurred but are not reflected in the route map.
5. Whether any features have been deleted or migrated but are not reflected in the route map.
6. Whether each entry contains at least one entry or core code location usable for next-time location lookup.
7. When the number of entries is large or module boundaries are clear, whether there is a lack of module index causing location difficulty.

If all pass, output "No update needed"; when missing critical location information is found, mark the result as `partial` and supplement confirmed information following this skill's normal process. After discovering other issues, update following this skill's normal process. No need to enter a complex audit process unless the user explicitly requests a comprehensive audit.
