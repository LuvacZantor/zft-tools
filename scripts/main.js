const ID = "zft-tools";
const VERSION = "0.1.0-dev.8";
const LOG = `[ZFT] 🛠️ v${VERSION} | ZFT Tools`;
const registeredTools = new Map();
const groups = new Map();

function validOwner(moduleId) {
  return typeof moduleId === "string" && !!game.modules.get(moduleId)?.active;
}
function registerTool(moduleId, tool) {
  if (!validOwner(moduleId) || !tool?.name || typeof tool.onChange !== "function") {
    console.warn(`${LOG} ⚠️ | Invalid tool registration`, moduleId, tool?.name);
    return false;
  }
  registeredTools.set(`${moduleId}:${tool.name}`, { moduleId, ...tool });
  if (game.ready) void ui.controls?.render?.({ force: true });
  return true;
}
function unregisterTool(moduleId, name) {
  const changed = registeredTools.delete(`${moduleId}:${name}`);
  if (changed && game.ready) void ui.controls?.render?.({ force: true });
  return changed;
}
/** Register an isolated SceneControl group owned by a participating module.
 * The owner retains the action callbacks and manages permissions on execution.
 * group id is the owner module's ID, preventing collision with other modules.
 */
function registerGroup(moduleId, definition) {
  if (!validOwner(moduleId) || !definition || !definition.title || !definition.icon || !Array.isArray(definition.tools)) {
    console.warn(`${LOG} ⚠️ | Invalid group registration`, moduleId);
    return false;
  }
  if (moduleId === ID || !definition.tools.every(tool => tool?.name && typeof tool.onChange === "function")) return false;
  groups.set(moduleId, { ...definition, tools: [...definition.tools] });
  if (game.ready) void ui.controls?.render?.({ force: true });
  return true;
}
function unregisterGroup(moduleId) {
  const changed = groups.delete(moduleId);
  if (changed && game.ready) void ui.controls?.render?.({ force: true });
  return changed;
}
Hooks.once("init", () => {
  game.modules.get(ID).api = Object.freeze({ registerTool, unregisterTool, registerGroup, unregisterGroup });
  console.info(`${LOG} 🚀 | Multi-group toolbar initialized`);
});

function neutral(name, icon, title) {
  return { name, icon, title, order: -100, button: false, visible: true, onChange: () => {} };
}
function orderEntries(collected, preferred = new Map()) {
  const n = ([id, tool]) => preferred.get(id) ?? (Number.isFinite(tool.order) ? tool.order : 1000);
  return Object.fromEntries(Object.entries(collected)
    .filter(([,tool]) => tool && typeof tool.onChange === "function" && (game.user.isGM || tool.gmOnly === false))
    .sort((a,b) => n(a)-n(b) || a[0].localeCompare(b[0])));
}
Hooks.on("getSceneControlButtons", controls => {
  if (!game.user) return;
  const collected = {};
  for (const tool of registeredTools.values()) {
    if (validOwner(tool.moduleId)) collected[tool.name] = { ...tool };
  }
  Hooks.callAll("zft-tools.collectTools", collected);
  const preferred = new Map([
    ["zft-cinematics",10],["zft-chat-bubbles",20],["zft-raised-hand",30],
    ["zft-cinematics-fade",40],["zft-cinematics-wipe-left",41],
    ["zft-cinematics-wipe-right",42],["zft-cinematics-wipe-up",43],
    ["zft-cinematics-wipe-down",44]
  ]);
  const shared = orderEntries(collected, preferred);
  if (Object.keys(shared).length) {
    const n = neutral("zft-tools-select", "fa-solid fa-toolbox", "ZFT Tools");
    controls[ID] = {
      name: ID, title: "ZFT Tools", icon: "fa-solid fa-toolbox", order: 1000,
      visible: true, activeTool: n.name, onChange: () => {},
      tools: { [n.name]: n, ...shared }
    };
  }
  for (const [owner, group] of groups) {
    if (!validOwner(owner)) continue;
    const visible = orderEntries(Object.fromEntries(group.tools.map(tool=>[tool.name,tool])));
    if (!Object.keys(visible).length) continue;
    const n = neutral(`${owner}-select`, group.icon, group.title);
    controls[owner] = {
      name: owner, title: group.title, icon: group.icon, order: group.order ?? 990,
      visible: true, activeTool: n.name, onChange: () => {},
      tools: { [n.name]: n, ...visible }
    };
  }
});
