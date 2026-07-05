import { app } from "../../scripts/app.js";
import { getWidget } from "./anima_apply_tags.js";

export const ANIMA_SECTION_WIDGETS = {
    artist: "artist_tags",
    character: "character_tags",
    clothing: "clothing_tags",
    background: "background_tags",
    pose: "pose_tags",
    composition: "composition_tags",
    expression: "expression_tags",
    lighting: "lighting_tags",
};

const WORKSPACE_SECTION_WIDGETS = {
    artist: "artist",
    background: "background",
    lighting: "lighting",
    composition: "composition",
};

const WORKSPACE_CHARACTER_FIELDS = {
    character: "name",
    clothing: "clothes",
    expression: "expression",
    pose: "pose",
};

function getGraphNodes() {
    const nodes = app?.graph?._nodes;
    return Array.isArray(nodes) ? nodes.filter(Boolean) : [];
}

function getNodeTitle(node) {
    return String(node?.title || node?.type || node?.comfyClass || `Node ${node?.id ?? ""}`).trim();
}

export function isAnimaPromptWorkspaceNode(node) {
    const type = String(node?.comfyClass || node?.type || "");
    return type === "AnimaPromptWorkspace";
}

function getPromptWorkspaceActiveCharacter(node) {
    const value = Number(getWidget(node, "active_character")?.value || 1);
    if (!Number.isFinite(value)) return 1;
    return Math.min(Math.max(Math.round(value), 1), 4);
}

export function getWorkspaceWidgetName(section, node) {
    if (!isAnimaPromptWorkspaceNode(node)) return "";
    const characterField = WORKSPACE_CHARACTER_FIELDS[section];
    if (characterField) {
        return `character${getPromptWorkspaceActiveCharacter(node)}_${characterField}`;
    }
    return WORKSPACE_SECTION_WIDGETS[section] || "";
}

export function resolveAnimaTargets(section = "artist", preferredNode = null) {
    if (!ANIMA_SECTION_WIDGETS[section] && !WORKSPACE_SECTION_WIDGETS[section] && !WORKSPACE_CHARACTER_FIELDS[section]) {
        return [];
    }

    const targets = [];
    for (const node of getGraphNodes()) {
        const widgetName = isAnimaPromptWorkspaceNode(node)
            ? getWorkspaceWidgetName(section, node)
            : ANIMA_SECTION_WIDGETS[section];
        if (!getWidget(node, widgetName)) {
            continue;
        }
        targets.push({
            id: `${node.id}:${widgetName}`,
            node,
            nodeId: node.id,
            nodeType: node.type || node.comfyClass || "",
            widgetName,
            section,
            label: `${getNodeTitle(node)} #${node.id} -> ${widgetName}`,
        });
    }

    if (preferredNode) {
        targets.sort((a, b) => {
            if (a.node === preferredNode) return -1;
            if (b.node === preferredNode) return 1;
            return 0;
        });
    }

    return targets;
}

export function getTargetById(section, id, preferredNode = null) {
    const targets = resolveAnimaTargets(section, preferredNode);
    return targets.find(target => target.id === id) || targets[0] || null;
}
