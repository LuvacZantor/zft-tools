const ID = 'zft-tools';
const VERSION = '0.1.0-dev.7';
const LOG = `[ZFT] 🛠️ v${VERSION} | ZFT Tools`;
const registeredTools = new Map();

/** Add a ZFT canvas action. Tools default to GM-only unless gmOnly is explicitly false. */
function registerTool(moduleId, tool) {
  if (typeof moduleId !== 'string' || !moduleId || !game.modules.get(moduleId)?.active) {
    console.warn(`${LOG} ⚠️ | Ignored registration from an inactive or unknown module`, moduleId);
    return false;
  }
  if (!tool || typeof tool.name !== 'string' || !tool.name || typeof tool.onChange !== 'function') {
    console.warn(`${LOG} ⚠️ | Invalid tool registration`, { moduleId, tool: tool?.name });
    return false;
  }
  registeredTools.set(`${moduleId}:${tool.name}`, { moduleId, ...tool });
  if (game.ready) void ui.controls?.render?.({ force: true });
  return true;
}

function unregisterTool(moduleId, toolName) {
  const deleted = registeredTools.delete(`${moduleId}:${toolName}`);
  if (deleted && game.ready) void ui.controls?.render?.({ force: true });
  return deleted;
}

Hooks.once('init', () => {
  game.modules.get(ID).api = Object.freeze({ registerTool, unregisterTool });
  console.info(`${LOG} 🚀 | Shared toolbar initialized`);
});

// All ZFT canvas tools live in one standard Foundry SceneControl group.
// An event hook is also provided for modules which register at script load.
Hooks.on('getSceneControlButtons', controls => {
  if (!game.user) return;
  const collected = {};
  for (const tool of registeredTools.values()) {
    if (game.modules.get(tool.moduleId)?.active) collected[tool.name] = { ...tool };
  }
  Hooks.callAll('zft-tools.collectTools', collected);
  // All tools are GM-only by default. A contributing module must opt in
  // explicitly with gmOnly:false for its controls to appear for players.
  // Do not rely on UI visibility alone for authorization inside actions.
  // Foundry V13 renders this tool dictionary in insertion order. Merely
  // setting a SceneControlTool.order does not reliably rearrange the second
  // column, because modules contribute at hook-registration time.
  // Assemble the dictionary in a deliberate, stable order instead.
  // These IDs match the currently supported ZFT toolbar contributors.
  const preferredOrder = new Map([
    ['zft-cinematics', 10],
    ['zft-chat-bubbles', 20],
    ['zft-raised-hand', 30],
    ['zft-cinematics-fade', 40],
    ['zft-cinematics-wipe-left', 41],
    ['zft-cinematics-wipe-right', 42],
    ['zft-cinematics-wipe-up', 43],
    ['zft-cinematics-wipe-down', 44]
  ]);
  const sortOrder = ([name, tool]) => {
    if (preferredOrder.has(name)) return preferredOrder.get(name);
    return Number.isFinite(tool.order) ? tool.order : 1000;
  };
  const tools = Object.fromEntries(Object.entries(collected)
    .filter(([, tool]) =>
      tool && typeof tool.onChange === 'function' && (game.user.isGM || tool.gmOnly === false)
    )
    .sort((a, b) => sortOrder(a) - sortOrder(b) || a[0].localeCompare(b[0]))
  );
  if (!Object.keys(tools).length) return;
  // V13 SceneControls must be able to resolve activeTool on BOTH entry
  // and exit. If its tool has visible:false, V13 can discard it from the
  // active control registry and crash when switching to Token Controls:
  // "Cannot read properties of undefined (reading 'onChange')".
  // Keep the neutral selector registered and *visible to the API*, then hide
  // only its rendered button using CSS. Contributed actions remain buttons.
  const neutralTool = {
    name: 'zft-tools-select',
    title: 'ZFT Tools',
    icon: 'fa-solid fa-toolbox',
    order: -100,
    button: false,
    visible: true,
    onChange: () => {}
  };
  controls[ID] = {
    name: ID,
    title: 'ZFT Tools',
    icon: 'fa-solid fa-toolbox',
    order: 1000,
    visible: true,
    activeTool: neutralTool.name,
    onChange: () => {},
    tools: { [neutralTool.name]: neutralTool, ...tools }
  };
});
