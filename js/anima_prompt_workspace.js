import { app } from "../../scripts/app.js";
import { getWidget, refreshNode } from "./anima_apply_tags.js";
import { SELECTOR_RANDOM_PROPERTY } from "./anima_selector_random.js";
import { openAnimaHub } from "./anima_hub.js";

const CHARACTER_SLOTS = 4;
const RANDOM_FIELDS = [
    ["artist", "画师"],
    ["character", "角色名"],
    ["clothing", "服装"],
    ["expression", "表情"],
    ["pose", "姿势"],
    ["background", "背景"],
    ["lighting", "光线"],
    ["composition", "构图"],
];

app.registerExtension({
    name: "AnimaPromptWorkspace.extension",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "AnimaPromptWorkspace") return;

        const origOnCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            origOnCreated?.apply(this, arguments);
            setupWorkspaceNode(this);
        };

        const origOnConfigure = nodeType.prototype.onConfigure;
        nodeType.prototype.onConfigure = function () {
            const result = origOnConfigure?.apply(this, arguments);
            setupWorkspaceNode(this);
            return result;
        };
    },
});

function setupWorkspaceNode(node) {
    if (!node) return;
    ensureWorkspacePanel(node);
    movePanelAfterActiveCharacter(node);
    node.__animaWorkspaceRefresh = () => {
        movePanelAfterActiveCharacter(node);
        updateWorkspacePanel(node);
        refreshNode(node);
    };
    updateWorkspacePanel(node);
}

function getRandomState(node) {
    node.properties = node.properties || {};
    const state = node.properties[SELECTOR_RANDOM_PROPERTY];
    if (state && typeof state === "object" && !Array.isArray(state)) {
        return state;
    }
    node.properties[SELECTOR_RANDOM_PROPERTY] = {};
    return node.properties[SELECTOR_RANDOM_PROPERTY];
}

function isRandomEnabled(node, section) {
    return Boolean(getRandomState(node)[section]);
}

function setRandomEnabled(node, section, enabled) {
    getRandomState(node)[section] = Boolean(enabled);
    updateWorkspacePanel(node);
    refreshNode(node);
}

function ensureWorkspacePanel(node) {
    if (node._animaWorkspacePanelWidget || typeof node.addDOMWidget !== "function") return;
    const panel = document.createElement("div");
    panel.className = "anima-workspace-panel";
    panel.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        color: #e5e7eb;
        font: 12px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        pointer-events: auto;
    `;

    const widget = node.addDOMWidget("anima_prompt_workspace_panel", "div", panel, {
        serialize: false,
        hideOnZoom: false,
        getValue: () => "",
        setValue: () => {},
    });
    widget.serialize = false;
    widget.computeSize = (width) => [width, 164];
    widget.computedHeight = 164;
    node._animaWorkspacePanelWidget = widget;
    node._animaWorkspacePanelEl = panel;
    movePanelAfterActiveCharacter(node);
}

function movePanelAfterActiveCharacter(node) {
    const widget = node?._animaWorkspacePanelWidget;
    if (!widget || !Array.isArray(node.widgets)) return;
    const currentIndex = node.widgets.indexOf(widget);
    const activeIndex = node.widgets.findIndex(item => item?.name === "active_character");
    if (currentIndex < 0 || activeIndex < 0 || currentIndex === activeIndex + 1) return;
    node.widgets.splice(currentIndex, 1);
    const nextActiveIndex = node.widgets.findIndex(item => item?.name === "active_character");
    node.widgets.splice(nextActiveIndex + 1, 0, widget);
}

function widgetText(node, name) {
    return String(getWidget(node, name)?.value || "").trim();
}

function activeCharacter(node) {
    const value = Number(widgetText(node, "active_character") || 1);
    return Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 1), CHARACTER_SLOTS) : 1;
}

function characterCount(node) {
    const value = Number(widgetText(node, "character_count") || 1);
    return Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 1), CHARACTER_SLOTS) : 1;
}

function createButton(label, onClick, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.style.cssText = `
        min-height: 28px;
        border-radius: 7px;
        border: 1px solid ${primary ? "rgba(56,189,248,0.56)" : "rgba(255,255,255,0.13)"};
        background: ${primary ? "rgba(14,165,233,0.24)" : "rgba(255,255,255,0.055)"};
        color: #f4f4f5;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        pointer-events: auto;
    `;
    button.addEventListener("pointerdown", event => event.stopPropagation());
    button.addEventListener("mousedown", event => event.stopPropagation());
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
    });
    return button;
}

function createRandomToggle(node, section, label) {
    const enabled = isRandomEnabled(node, section);
    const button = createButton(`${label}: ${enabled ? "随机开" : "随机关"}`, () => {
        setRandomEnabled(node, section, !isRandomEnabled(node, section));
    });
    button.style.background = enabled ? "rgba(14,165,233,0.22)" : "rgba(255,255,255,0.045)";
    button.style.borderColor = enabled ? "rgba(56,189,248,0.52)" : "rgba(255,255,255,0.1)";
    button.style.color = enabled ? "#f0f9ff" : "#a1a1aa";
    return button;
}

function updateWorkspacePanel(node) {
    const panel = node._animaWorkspacePanelEl;
    if (!panel) return;
    panel.innerHTML = "";

    const top = document.createElement("div");
    top.style.cssText = "display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:7px;";
    top.appendChild(createButton("打开 Anima Prompt Hub", () => openAnimaHub("character", node), true));

    const meta = document.createElement("div");
    meta.textContent = `Hub写入角色: 第${activeCharacter(node)}格 / 输出角色: ${characterCount(node)}个`;
    meta.style.cssText = "color:#cbd5e1;font-weight:750;white-space:nowrap;";
    top.appendChild(meta);
    panel.appendChild(top);

    const note = document.createElement("div");
    note.textContent = "下方字段可手动微调；LLM 只读取角色、背景、光线、构图。";
    note.style.cssText = "color:#94a3b8;margin-bottom:7px;";
    panel.appendChild(note);

    const randomGrid = document.createElement("div");
    randomGrid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;";
    RANDOM_FIELDS.forEach(([section, label]) => randomGrid.appendChild(createRandomToggle(node, section, label)));
    panel.appendChild(randomGrid);
}
