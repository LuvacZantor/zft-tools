# ZFT Tools v0.1.0-dev.12

Foundry VTT V13 development build. Preserves the dev.8 shared `registerTool`, `registerGroup`, and unregister APIs.

## Organizer

Use the **Configure ZFT Tools** action at the end of the ZFT Tools group, or **Module Settings → ZFT Tools → Configure ZFT Tools**. Drag action rows to change their order, check/uncheck to show/hide, choose **Save Layout**, or **Reset Default**. The saved layout is client-scoped and survives refreshes; new tools appear automatically using module-defined order. Hidden actions remain available to their modules and permissions are unchanged.

The organizer only affects the *actions inside the shared ZFT Tools group*. It does not change Foundry's primary controls, separately registered module groups (such as Overland Travel), or third-party controls.

Live V13 verification is still pending. Compatible baseline: ZFT Tools v0.1.0-dev.8.

## dev.10
Live updates now refresh the cached V13 ZFT Tools control definition when saving or resetting a client layout. Organizer list scrolls within a fixed-height window, leaving Save and Reset accessible. No other Foundry control groups are modified.

### dev.11 shared toolbar layouts
GM-configured role-specific layouts are stored in a world setting. The organizer has GM and Player tabs, per-tool show/hide, drag ordering, palette and custom color. Players receive the configured player layout subject to module permission checks. Player-visible registrations may differ on GM clients. Existing client settings are not deleted.

Color overrides now target V13 action buttons by tool ID rather than assuming tool buttons are nested inside the control group. Existing module palette defaults are left intact.
