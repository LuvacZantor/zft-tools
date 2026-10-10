# ZFT Tools v0.1.0-dev.7

**Shared left-toolbar control group for ZFT modules.** Test build targeting Foundry VTT V13 Build 351. V14 has matching scene-control hook types but has not been live tested.

ZFT Tools now uses an Arcane Emerald (`#28E887`) identity with category-colored inactive action buttons and a highlighted one-shot Cinematics selection. ZFT Tools adds a GM-only **ZFT Tools** icon (emerald toolbox) to Foundry's left canvas toolbar. The icon appears when at least one active module contributes a tool. Clicking it only selects the ZFT group and exposes canvas actions in the adjacent tools column. A neutral default tool prevents opening contributed dialogs on group selection. Its button is hidden with CSS but stays registered with Foundry V13, so switching straight from ZFT Tools to Token Controls does not produce an undefined onChange error. ZFT Cinematics v0.1.0-dev.9 contributes the first tool.

- Does not replace the existing sidebar tabs, settings screens, or tools used by unrelated modules.
- Does not automatically move existing ZFT modules. They can opt in when updated.
- Does not modify GM scenes, tokens, or player settings.
- No external dependencies.

## For ZFT developers

Use either the synchronous hook (safest for startup ordering) or the `zft-tools` API.

```js
Hooks.on('zft-tools.collectTools', tools => {
  tools['my-module-action'] = {
    name: 'my-module-action', title: 'My Action',
    icon: 'fa-solid fa-play', order: 20, button: true, visible: game.user.isGM,
    onChange: () => doMyAction()
  };
});
```

The API is `game.modules.get('zft-tools').api.registerTool(moduleId, tool)` and `unregisterTool(moduleId, toolName)`. Registered tools are included only while their owning module remains active. Do not register the same tool through both routes.

## Install/test

Install to `Data/modules/zft-tools`, enable this module **and** ZFT Cinematics in the test world, restart Foundry because manifests changed, then reload connected browsers. Select the emerald toolbox on the left; Cinematics should be inside. The toolbox and tools should not appear to a regular player. This is a dev build, not a production release.

## Dev 4 change

- Fixed scene-control switching error when leaving ZFT Tools for Token Controls. Neutral activeTool remains registered (`visible: true`), while CSS hides its icon.
- No changes to the Cinematics or Chat Bubbles modules.

## Dev 5 change

- Color-coded existing idle right-column actions without modifying callback logic:
  - Cinematics Defaults settings (gear): Cyan `#5BC0EB`.
  - Chat Bubbles: Violet `#B39AF2`.
  - Fade and wipe effects: Teal `#3FD6C5`.
  - Main ZFT Tools toolbox stays emerald `#28E887`; any unassigned actions stay silver.
- Hover, active, and armed one-shot transitions retain emerald highlights, and the Dev 4 neutral selection fix is unchanged.
- Amber `#E6B422` is reserved for potential future turn/time controls; no buttons were added or moved.

## Dev 6: Player-visible ZFT Tools

- Allow players to select ZFT Tools when at least one contributed tool sets `gmOnly: false`.
- Keep all tools GM-only by default, so Cinematics is not exposed to players.
- Preserve the visible-to-core/hidden-in-CSS neutral selector and direct switching to Token Controls.
- Raised Hands and Chat Bubbles are given violet idle icons, emerald on hover or active.
- This update requires the associated Raised Hands and Chat Bubbles module patches.

## Dev 7 change

- Stable fixed right-column order (Cinematics Settings, Chat Bubbles, Raised Hands, Fade, Wipes L/R/U/D), independent of module hook load order.
- Player permission filtering and neutral selector behavior unchanged.
- Overrides tool order for the eight known ZFT buttons; future contributors use their normal `order` value.
