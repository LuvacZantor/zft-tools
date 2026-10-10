# ZFT Development, Versioning, and Release Workflow

This document is the shared workflow for **Zantor's Realms Foundry Tools (ZFT)** GitHub repositories, including `zft-tools` and `zft-cinematics`.

**Core rule:** Keep working code stable, test changes before promotion, and do not publish a GitHub Release or update stable source without the owner's explicit approval.

## Branches

| Branch/ref | Purpose |
| --- | --- |
| `main` | Stable, accepted code. The default branch. |
| `develop` | Ongoing development and Foundry test builds. May contain unfinished or unverified work. |
| Optional feature branch | Isolated changes when useful. Merge back into `develop` after testing. Delete when no longer needed. |
| `vX.Y.Z` tag | Permanent marker for an accepted release commit on `main`, **not** a working branch. |

Do not create version-number branches such as `v1.1.0`. Those names belong to tags/releases.

**Never merge or copy development code into `main` simply because a build compiles, passes simulated tests, or looks complete.** Promotion requires successful live testing and approval.

Documentation or repository housekeeping may be committed to `main` without promoting an untested implementation. Do not overwrite stable module files as part of housekeeping.

## Version numbers

Use semantic versions in `MAJOR.MINOR.PATCH` form:

- **PATCH** for compatible bug fixes.
- **MINOR** for new, compatible functionality.
- **MAJOR** for a breaking or substantially incompatible release.

Use sequential development suffixes for test builds:

```text
0.1.0-dev.1
0.1.0-dev.2
0.1.0-dev.3
```

After approval, the accepted build becomes the stable version (for example, `0.1.0`). Choose the release number based on changes actually made, not an arbitrary jump. Do not increase a version merely to produce another ZIP filename or document update.

**The `version` in `module.json` is authoritative.** Keep the ZIP filename, relevant logs, README/release documentation, and any other displayed build version consistent with it.

## Development workflow

1. Begin from the appropriate development branch, usually `develop`; use an optional feature branch only when it improves isolation.
2. Make the focused change. Preserve working behavior and existing functionality.
3. Update `module.json` and references to the same development version when a new test build is warranted.
4. Validate JSON, JavaScript syntax, archive structure, and the affected APIs. Automated checks do **not** equal live Foundry verification.
5. Package the test build and provide a short, specific test procedure.
6. Test in the intended Foundry environment. Fix regressions on the development branch and issue the next `-dev.N` build as necessary.
7. Record what passed, what failed, and any unresolved compatibility issues. Do not claim V13/V14 verified without testing each target.
8. When the owner explicitly accepts the build, prepare its stable version and ask for explicit authorization before promoting it to `main`.

The normal priority is **production stability over experimental functionality**. In particular, V13 Build 351 is a current production target; V14 support should be validated separately, not inferred.

## Promoting to main

Once the owner confirms that a development build is accepted:

1. Confirm exactly which tested commit/build is being released and which changes are included.
2. Update the stable version in `module.json`, logs, and applicable documentation. The version must match the scope of the release.
3. Prepare a changelog/release summary and validate that the stable package matches the final code.
4. Merge the approved code into `main` only after explicit authorization. Preserve existing history; do not force-push or replace `main` with an unrelated tree.
5. Confirm the source and version now on `main`.
6. Create the GitHub release tag from the **approved `main` commit**, not from an experimental or unfinished branch.
7. Publish the GitHub Release using that exact tag, the matching ZIP, and release notes.
8. Keep `develop` for subsequent work; do not treat it as the release branch.

A release is not complete merely because files were uploaded to `main`. GitHub **tags and Releases** preserve the versioned release point; `main` shows the latest accepted source.

## GitHub Release publication

When a release cannot be created directly through the available GitHub integration, prepare the stable code, version, ZIP, and release notes, then finish manually:

1. Open the repository in GitHub and select **Releases → Draft a new release**.
2. Choose or create tag `vX.Y.Z` using the accepted `main` commit as the target.
3. Enter a short release title and the prepared release notes.
4. Attach `<module-id>-vX.Y.Z.zip`.
5. Review the tag, version, and asset, then select **Publish release**.

Do not publish a release or tag untested development builds unless explicitly requested. Do not assume a GitHub Release was published until GitHub confirms it.

## Repository and ZIP layout

Keep Foundry module files at the **repository root**:

```text
module.json
README.md
scripts/
styles/
templates/  (when needed)
```

Development and stable ZIP names use the canonical module ID and matching semantic version:

```text
zft-cinematics-v0.1.0-dev.3.zip
zft-cinematics-v0.1.0.zip
```

Each ZIP contains **one** top-level folder using the module ID, irrespective of its filename:

```text
zft-cinematics/
  module.json
  scripts/
  styles/
```

No ZIP timestamp suffix, second nested module folder, `-final` suffix, or mismatched versions.

## Testing and rollback

- Provide concrete Foundry reproduction steps: action, expected behavior, and what errors to report.
- When practical, test both GM and player clients, especially for sockets, scenes, and synchronized effects.
- Distinguish passing local/simulated checks from confirmed behavior in Foundry.
- Keep a known-good release available for rollback. If a new build misbehaves during a session, return to the last accepted version rather than patching production live.
- For installed modules, a browser refresh normally reloads changed client scripts and CSS; restart Foundry when package/manifest changes or the environment warrants it.

## Approval rules

**The owner decides when a build is accepted, when `main` is updated, and when a release is published.**

The assistant may prepare and test changes, update the approved development branch, and draft release material. It must not silently promote unverified code to `main`, create a release tag prematurely, or claim a GitHub Release exists without verification.

## Related repositories

- [ZFT Tools](https://github.com/LuvacZantor/zft-tools)
- [ZFT Cinematics](https://github.com/LuvacZantor/zft-cinematics)
- [ZFT Turn Time](https://github.com/LuvacZantor/zft-turn-time)
- [ZFT Critical Fumbles](https://github.com/LuvacZantor/zft-critical-fumbles)
