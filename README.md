# ZFT Tools

Shared Foundry VTT canvas controls for the **Zantor's Realms Foundry Tools (ZFT)** modules.

## Purpose

ZFT Tools provides one recognizable, GM-only control group in Foundry's left-hand canvas toolbar. Each participating ZFT module can contribute its own actions without replacing its existing sidebar tabs, settings, or workflows.

ZFT Cinematics is the first planned integration. Other ZFT modules can opt in as needed.

## Planned behavior

- One yellow **ZFT Tools** toolbar group.
- Tool buttons contributed by enabled, participating ZFT modules.
- GM-only visibility for administrative canvas actions.
- Minimal shared code and no unnecessary changes to existing ZFT interfaces.

## Development status

**In development.** Source builds are being validated with ZFT Cinematics before an initial release is tagged. No stable release is published from this repository yet.

- Current development version: `0.1.0-dev.1`
- Target: Foundry VTT V13 Build 351
- V14: planned; not live verified
- License: MIT

## Development and releases

See [DEVELOPMENT.md](DEVELOPMENT.md) for the shared ZFT branching, testing, versioning, promotion-to-main, and GitHub Release workflow.

## Repository conventions

- `main` is the default branch.
- Development builds use prerelease version numbers such as `0.1.0-dev.1`.
- Stable versions will be tagged and published through GitHub Releases after testing.
- Foundry module files live at the repository root (`module.json`, `scripts/`, `styles/`), not inside an extra nested module folder.
- ZIP distribution packages use a single top-level `zft-tools/` directory.

## Related

- [ZFT Cinematics](https://github.com/LuvacZantor/zft-cinematics)
- [ZFT Turn Time](https://github.com/LuvacZantor/zft-turn-time)
