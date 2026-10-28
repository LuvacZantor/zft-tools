const ID = "zft-tools";
const VERSION = "0.1.0-dev.12";
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
  if (game.ready) void refreshSharedToolbar();
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
  if (game.ready) void refreshSharedToolbar();
  return true;
}
function unregisterGroup(moduleId) {
  const changed = groups.delete(moduleId);
  if (changed && game.ready) void ui.controls?.render?.({ force: true });
  return changed;
}
// World-shared GM/Player profiles. A legacy client layout is imported only as
// a one-time suggestion for the GM; it never overrides shared world settings.
const ORDER_SETTING = "toolLayout";
const WORLD_SETTING = "roleLayouts";
const ORGANIZER_NAME = "zft-tool-organizer";
const PALETTE = ["#28E887", "#38BDF8", "#E9B85F", "#A78BFA", "#F472B6", "#F1E9D8"];
const DEFAULT_COLOR = "#28E887";
const preferred = new Map([
  ["zft-cinematics",10],["zft-chat-bubbles",20],["zft-raised-hand",30],
  ["zft-cinematics-fade",40],["zft-cinematics-wipe-left",41],
  ["zft-cinematics-wipe-right",42],["zft-cinematics-wipe-up",43],
  ["zft-cinematics-wipe-down",44]
]);
const normalize = v => ({
  order:Array.isArray(v?.order)?v.order.filter(x=>typeof x==="string"):[],
  hidden:Array.isArray(v?.hidden)?v.hidden.filter(x=>typeof x==="string"):[],
  colors:Object.fromEntries(Object.entries(v?.colors??{}).filter(([k,c])=>typeof k==="string"&&typeof c==="string"&&/^#[0-9a-f]{6}$/i.test(c)))
});
function getLayout(role = game.user?.isGM ? "gm" : "player") {
  const layouts = game.settings.get(ID,WORLD_SETTING) ?? {};
  return normalize(layouts[role]);
}
function roleCanSee(tool,role) { return tool && typeof tool.onChange === "function" && (role === "gm" || tool.gmOnly === false) && tool.visible !== false; }
function cssSafeColor(color) {return /^#[0-9a-f]{6}$/i.test(color??"") ? color : DEFAULT_COLOR;}
function escapedAttr(value) {return String(value).replaceAll('\\','\\\\').replaceAll('"','\\"');}
function applyToolColors() {
  // V13 renders action buttons outside their control group's data-control node.
  // Target only known, currently registered ZFT shared actions by their unique IDs.
  // A late stylesheet and !important override defaults in contributing modules.
  const styleId = "zft-tools-role-colors";
  const prior = document.getElementById(styleId);
  const known = new Set(Object.keys(sharedTools()));
  const colors = getLayout().colors;
  const rules = Object.entries(colors)
    .filter(([id, color]) => known.has(id) && /^#[0-9a-f]{6}$/i.test(color))
    .map(([id, color]) => {
      const attr = escapedAttr(id), safeColor = cssSafeColor(color);
      const base = `#scene-controls :is([data-tool="${attr}"],[data-action="${attr}"])`;
      // Both V13 data-action and legacy data-tool markup are supported.
      // Color icon descendants explicitly to defeat module CSS !important rules.
      return `${base}, ${base} :is(i,svg,.control-icon), ${base} svg :is(path,use) {color:${safeColor} !important;}`;
    }).join("\n");
  if (!rules) { prior?.remove(); return; }
  const tag = prior ?? document.createElement("style");
  tag.id = styleId;
  tag.textContent = rules;
  // Re-append last to reliably win against existing module CSS at equal priority.
  document.head.appendChild(tag);
}

function sharedTools() {
  const collected = {};
  for (const tool of registeredTools.values()) {
    if (validOwner(tool.moduleId)) collected[tool.name] = { ...tool };
  }
  Hooks.callAll("zft-tools.collectTools", collected);
  // Keep organizer outside stored preferences and never hide it.
  delete collected[ORGANIZER_NAME];
  return collected;
}
function baseOrder(id,tool) { return preferred.get(id) ?? (Number.isFinite(tool.order) ? tool.order : 1000); }
function toolVisible(tool) { return tool && typeof tool.onChange === "function" && (game.user.isGM || tool.gmOnly === false) && tool.visible !== false; }
function sortedVisibleTools(role="gm") {
  const all = Object.entries(sharedTools()).filter(([, t]) => roleCanSee(t,role));
  return all.sort((a,b)=>baseOrder(a[0],a[1])-baseOrder(b[0],b[1]) || a[0].localeCompare(b[0]));
}
function orderedShared(collected) {
  const layout=getLayout();
  const entries=Object.entries(collected).filter(([,tool]) => roleCanSee(tool,game.user.isGM?"gm":"player") && !layout.hidden.includes(tool.name));
  const rank=new Map(layout.order.map((name,i)=>[name,i]));
  entries.sort((a,b)=>{
    const ai=rank.get(a[0]), bi=rank.get(b[0]);
    if(ai!==undefined && bi!==undefined) return ai-bi;
    if(ai!==undefined) return -1;
    if(bi!==undefined) return 1;
    return baseOrder(a[0],a[1])-baseOrder(b[0],b[1]) || a[0].localeCompare(b[0]);
  });
  // In V13 Foundry orders controls using its own numeric .order property.
  return Object.fromEntries(entries.map(([key,tool],i)=>[key,{...tool,order:i+1}]));
}


// V13 SceneControls caches the getSceneControlButtons result in controls.
// Rendering alone does not re-run that hook. Update ONLY our own group data,
// then redraw; do not mutate another module's toolbar groups.
function buildSharedTools() {
  const shared = orderedShared(sharedTools());
  shared[ORGANIZER_NAME] = { name: ORGANIZER_NAME, title: "Configure ZFT Tools",
    icon: "fa-solid fa-sliders", order: 9999, button: true, visible: true,
    gmOnly: true, onChange: () => openOrganizer() };
  return { ...shared };
}
let refreshing = Promise.resolve();
function refreshSharedToolbar() {
  refreshing = refreshing.catch(() => {}).then(async () => {
    const controls = ui.controls;
    if (!controls || !game.ready) return;
    const current = controls.controls?.[ID];
    if (current) {
      current.tools = {
        ["zft-tools-select"]: neutral("zft-tools-select", "fa-solid fa-toolbox", "ZFT Tools"),
        ...buildSharedTools()
      };
    }
    await controls.render({ force: true });
    applyToolColors();
  }).catch(error => console.error(`${LOG} | Failed to refresh shared toolbar`, error));
  return refreshing;
}

class ZFTToolOrganizer extends FormApplication {
  constructor(...args) {super(...args);this.role="gm";}
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id:"zft-tool-organizer",title:"ZFT Tools | Tool Organizer",
      template:"modules/zft-tools/templates/organizer.hbs",width:520,height:620,
      classes:["zft-tool-organizer"],closeOnSubmit:false,submitOnChange:false,resizable:true
    });
  }
  getData() {
    const layout=getLayout(this.role),available=sortedVisibleTools(this.role);
    const rank=new Map(layout.order.map((id,i)=>[id,i]));
    const ordered=available.slice().sort((a,b)=>{
      const ai=rank.get(a[0]),bi=rank.get(b[0]);
      if(ai!==undefined&&bi!==undefined)return ai-bi;
      if(ai!==undefined)return -1;
      if(bi!==undefined)return 1;
      return 0;
    });
    return {isGM:game.user.isGM,gmSelected:this.role==="gm",playerSelected:this.role==="player",
      tools:ordered.map(([id,t])=>({id,label:t.title||id,owner:t.moduleId||"Registered via hook",
      icon:t.icon||"fa-solid fa-wrench",enabled:!layout.hidden.includes(id),
      color:layout.colors[id]??DEFAULT_COLOR,
      palette:PALETTE.map(hex=>({hex,selected:(layout.colors[id]??DEFAULT_COLOR)===hex}))})),
      roleLabel:this.role==="gm"?"GM":"Player"};
  }
  activateListeners(html) {
    super.activateListeners(html);
    const list=html.find('.zft-organizer-list')[0];
    let dragged=null;
    list?.addEventListener('dragstart',ev=>{
      const row=ev.target.closest('[data-zft-tool]');if(!row)return;
      dragged=row;row.classList.add('dragging');ev.dataTransfer.effectAllowed='move';
      ev.dataTransfer.setData('text/plain',row.dataset.zftTool);
    });
    list?.addEventListener('dragover',ev=>{
      const row=ev.target.closest('[data-zft-tool]');if(!row||!dragged||row===dragged)return;
      ev.preventDefault();const rect=row.getBoundingClientRect();
      list.insertBefore(dragged,ev.clientY<rect.top+rect.height/2?row:row.nextSibling);
    });
    list?.addEventListener('drop',ev=>ev.preventDefault());
    list?.addEventListener('dragend',()=>{dragged?.classList.remove('dragging');dragged=null;});
    html.find('[data-role]').on('click',async ev=>{
      ev.preventDefault();this.role=ev.currentTarget.dataset.role;this.render(true);
    });
    html.find('[data-preset]').on('click',ev=>{
      ev.preventDefault();const btn=ev.currentTarget,row=btn.closest('[data-zft-tool]');
      row.querySelector('[data-icon-color]').value=btn.dataset.preset;
      row.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('selected',x===btn));
      row.querySelector('.zft-organizer-icon').style.color=btn.dataset.preset;
    });
    html.find('[data-icon-color]').on('input',ev=>{
      const row=ev.currentTarget.closest('[data-zft-tool]');
      row.querySelector('.zft-organizer-icon').style.color=ev.currentTarget.value;
      row.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('selected',x.dataset.preset.toLowerCase()===ev.currentTarget.value.toLowerCase()));
    });
    html.find('[data-action="save-layout"]').on('click',async ev=>{
      ev.preventDefault();if(!game.user.isGM)return;
      const rows=[...list.querySelectorAll('[data-zft-tool]')];
      const current=game.settings.get(ID,WORLD_SETTING)??{};
      const colors=Object.fromEntries(rows.map(row=>[row.dataset.zftTool,row.querySelector('[data-icon-color]').value]));
      current[this.role]={order:rows.map(row=>row.dataset.zftTool),
        hidden:rows.filter(row=>!row.querySelector('input[type="checkbox"]').checked).map(row=>row.dataset.zftTool),colors};
      await game.settings.set(ID,WORLD_SETTING,current);
      await refreshSharedToolbar();
      ui.notifications.info(`ZFT Tools ${this.role.toUpperCase()} layout saved for the world.`);
      this.render(true);
    });
    html.find('[data-action="reset-layout"]').on('click',async ev=>{
      ev.preventDefault();if(!game.user.isGM)return;
      const current=game.settings.get(ID,WORLD_SETTING)??{};
      current[this.role]={order:[],hidden:[],colors:{}};
      await game.settings.set(ID,WORLD_SETTING,current);
      await refreshSharedToolbar();this.render(true);
    });
  }
  async _updateObject() {}
}
function openOrganizer() { if(!game.user.isGM) return ui.notifications.warn("Only a GM may organize ZFT Tools."); new ZFTToolOrganizer().render(true); }

Hooks.once("init", () => {
  game.settings.register(ID, WORLD_SETTING,{name:"GM and Player toolbar layouts",scope:"world",config:false,type:Object,default:{gm:{order:[],hidden:[],colors:{}},player:{order:[],hidden:[],colors:{}}},onChange:()=>{if(game.ready) void refreshSharedToolbar();}});
  game.settings.register(ID, ORDER_SETTING, {name:"ZFT Tools layout",scope:"client",config:false,
    type:Object,default:{order:[],hidden:[]},onChange:()=>{if(game.ready) void refreshSharedToolbar();}});
  game.settings.registerMenu(ID,"organizer",{name:"Configure ZFT Tools",label:"Open Tool Organizer",
    hint:"GM-controlled order, visibility, and color of shared GM/Player toolbar layouts.",icon:"fas fa-sliders",
    type:ZFTToolOrganizer,restricted:true});
  game.modules.get(ID).api = Object.freeze({ registerTool, unregisterTool, registerGroup, unregisterGroup, openOrganizer });
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
  const shared = buildSharedTools();
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

Hooks.once("ready",()=>{ applyToolColors(); });
// Foundry can rebuild controls when another module registers actions. Keep the
// user-selected palette applied to newly-rendered button elements as well.
Hooks.on("renderSceneControls", () => { applyToolColors(); });
