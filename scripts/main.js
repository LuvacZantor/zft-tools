const ID = 'zft-tools';
const VERSION = '0.1.0-dev.1';
const LOG = `[ZFT] 🛠️ v${VERSION} | ZFT Tools`;
const registeredTools = new Map();

/** Add a GM canvas action to the ZFT Tools control group. */
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
  if (!game.user?.isGM) return;
  const tools = {};
  for (const tool of registeredTools.values()) {
    if (game.modules.get(tool.moduleId)?.active) tools[tool.name] = { ...tool };
  }
  Hooks.callAll('zft-tools.collectTools', tools);
  if (!Object.keys(tools).length) return;
  const firstTool = Object.values(tools).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0];
  controls[ID] = {
    name: ID,
    title: 'ZFT Tools',
    icon: 'fa-solid fa-toolbox',
    order: 1000,
    visible: true,
    activeTool: firstTool.name,
    onChange: () => {},
    tools
  };
});
