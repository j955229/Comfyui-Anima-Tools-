import { app } from "../../scripts/app.js";
import { t } from "./i18n.js";

app.registerExtension({
    name: "AnimaMultiLoraLoader.extension",

    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "AnimaMultiLoraLoader") {
            const origOnCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                origOnCreated?.apply(this, arguments);

                // Initialize private state
                this._loraData = [];
                this._dynamicWidgets = [];

                // 同步隐藏并初始化，与其它选择器的同步模式保持 100% 绝对一致
                hideJsonWidgetFully(this);
                syncLoraWidgets(this, this._loraData);
            };

            // Hook configure to restore workflow state properly
            const origOnConfigure = nodeType.prototype.onConfigure;
            nodeType.prototype.onConfigure = function (info) {
                // Pre-configure: Extract and restore the dynamic widgets structure before LiteGraph reads values
                if (info && info.widgets_values) {
                    let savedLoraData = [];
                    for (const val of info.widgets_values) {
                        if (typeof val === "string" && val.startsWith("[")) {
                            try {
                                const parsed = JSON.parse(val);
                                if (Array.isArray(parsed)) {
                                    savedLoraData = parsed;
                                    break;
                                }
                            } catch (e) {}
                        }
                    }
                    if (savedLoraData.length > 0) {
                        this._loraData = savedLoraData;
                        syncLoraWidgets(this, savedLoraData);
                    }
                }

                origOnConfigure?.apply(this, arguments);
                hideJsonWidgetFully(this);
            };
        }
    }
});

// Helper to reliably hide the json list widget
function hideJsonWidgetFully(node) {
    const jsonWidget = node.widgets?.find(w => w.name === "lora_list_json");
    if (jsonWidget) {
        jsonWidget.type = "hidden";
        jsonWidget.draw = () => {};
        jsonWidget.computeSize = () => [0, -4];
        if (jsonWidget.el) {
            jsonWidget.el.style.display = "none";
            jsonWidget.el.style.height = "0px";
            jsonWidget.el.style.padding = "0px";
            jsonWidget.el.style.margin = "0px";
            jsonWidget.el.style.visibility = "hidden";
        }
        if (jsonWidget.inputEl) {
            jsonWidget.inputEl.style.display = "none";
            jsonWidget.inputEl.style.height = "0px";
            jsonWidget.inputEl.style.padding = "0px";
            jsonWidget.inputEl.style.margin = "0px";
            jsonWidget.inputEl.style.visibility = "hidden";
        }
    }
}

// Dynamic widget synchronization
function syncLoraWidgets(node, loras) {
    try {
        // 1. Record current width before any widgets change
        const currentWidth = node.size ? node.size[0] : 0;

        // 2. Physically remove all previous dynamic widgets matching certain prefixes or names
        if (node.widgets) {
            for (let i = node.widgets.length - 1; i >= 0; i--) {
                const w = node.widgets[i];
                if (w && w.name) {
                    const wName = typeof w.name === "string" ? w.name : String(w.name);
                    if (
                        wName.startsWith("❌") || 
                        wName.includes("Model Str") || 
                        wName.includes("Clip Str") || 
                        wName === t("Open LoRA Selector") ||
                        wName === "Open LoRA Selector"
                    ) {
                        if (w.el && w.el.parentNode) {
                            w.el.parentNode.removeChild(w.el);
                        }
                        node.widgets.splice(i, 1);
                    }
                }
            }
        }
        node._dynamicWidgets = [];

        // 3. Add control widgets for each LoRA
        for (let i = 0; i < loras.length; i++) {
            const lora = loras[i];
            if (!lora || !lora.name) continue;

            // Button to remove the LoRA (Truncate display name to prevent node border overflow)
            let displayName = lora.name;
            if (displayName.endsWith(".safetensors")) {
                displayName = displayName.slice(0, -12);
            }
            const lastSlash = Math.max(displayName.lastIndexOf("/"), displayName.lastIndexOf("\\"));
            if (lastSlash !== -1) {
                displayName = displayName.substring(lastSlash + 1);
            }
            const maxLen = 22;
            if (displayName.length > maxLen) {
                displayName = displayName.substring(0, maxLen - 3) + "...";
            }

            const delBtn = node.addWidget("button", `❌ ${displayName}`, null, () => {
                const nextLoras = node._loraData.filter(x => x.name !== lora.name);
                node._loraData = nextLoras;
                updateJsonValue(node);
                syncLoraWidgets(node, nextLoras);
            });
            delBtn.computedHeight = 24;
            if (delBtn.el) {
                delBtn.el.style.cssText += `
                    color: #ef4444 !important;
                    border: 1px solid rgba(239, 68, 68, 0.2) !important;
                    background: rgba(239, 68, 68, 0.05) !important;
                    font-size: 11px !important;
                    text-align: left !important;
                    padding-left: 8px !important;
                    margin-top: 4px !important;
                `;
            }
            node._dynamicWidgets.push(delBtn);

            // Use zero-width space (\u200B) repeat sequence as unique suffix to prevent LiteGraph merge,
            // so that the rendered name has absolutely no extra bracket explanation, looking clean.
            const modelWidgetName = "   Model Str" + "\u200B".repeat(i);
            const clipWidgetName = "   Clip Str" + "\u200B".repeat(i);

            // Slider for Model Strength
            const modelSlider = node.addWidget("slider", modelWidgetName, lora.strength_model ?? 1.0, (val) => {
                lora.strength_model = parseFloat(parseFloat(val).toFixed(2));
                updateJsonValue(node);
            }, { min: -2.0, max: 2.0, step: 0.1, precision: 2 });
            modelSlider.computedHeight = 18;
            node._dynamicWidgets.push(modelSlider);

            // Slider for Clip Strength
            const clipSlider = node.addWidget("slider", clipWidgetName, lora.strength_clip ?? 1.0, (val) => {
                lora.strength_clip = parseFloat(parseFloat(val).toFixed(2));
                updateJsonValue(node);
            }, { min: -2.0, max: 2.0, step: 0.1, precision: 2 });
            clipSlider.computedHeight = 18;
            node._dynamicWidgets.push(clipSlider);
        }

        // 4. Add Open LoRA Selector Button at the very bottom of the node
        const btnWidget = node.addWidget("button", t("Open LoRA Selector"), null, async () => {
            await openLoraSelectorModal(node);
        });
        
        // Style the button (matching artist selector blue sci-fi aesthetics)
        if (btnWidget && btnWidget.el) {
            btnWidget.el.style.cssText += `
                border: 1px solid rgba(11, 140, 233, 0.4) !important;
                background: linear-gradient(135deg, rgba(11, 140, 233, 0.1), rgba(2, 86, 145, 0.15)) !important;
                color: #7dd3fc !important;
                font-weight: 600 !important;
                margin-top: 8px !important;
                margin-bottom: 4px !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
            `;
            btnWidget.el.onmouseover = () => {
                btnWidget.el.style.boxShadow = "0 0 12px rgba(11, 140, 233, 0.35)";
                btnWidget.el.style.background = "linear-gradient(135deg, rgba(11, 140, 233, 0.25), rgba(2, 86, 145, 0.3))";
            };
            btnWidget.el.onmouseout = () => {
                btnWidget.el.style.boxShadow = "none";
                btnWidget.el.style.background = "linear-gradient(135deg, rgba(11, 140, 233, 0.1), rgba(2, 86, 145, 0.15))";
            };
        }
        node._dynamicWidgets.push(btnWidget);

        // 5. Recompute node size and refresh canvas
        hideJsonWidgetFully(node);
        
        const idealSize = node.computeSize();
        const w = Math.max(currentWidth, idealSize[0]);
        const h = idealSize[1];
        
        if (node.setSize) {
            node.setSize([w, h]);
        } else {
            node.size = [w, h];
        }
        
        node.setDirtyCanvas(true, true);
    } catch (err) {
        console.error("[Anima Tools] Error in syncLoraWidgets:", err);
    }
}

function updateJsonValue(node) {
    const jsonWidget = node.widgets.find(w => w.name === "lora_list_json");
    if (jsonWidget) {
        jsonWidget.value = JSON.stringify(node._loraData || []);
    }
}

// Global caching variables
let globalLoraConfig = null;
let globalLocalLoras = null;
let globalFavorites = null;
const civitaiSearchCache = {
    get(url) {
        try {
            const raw = localStorage.getItem("anima-civitai-search-cache");
            if (!raw) return null;
            const cache = JSON.parse(raw);
            return cache[url] || null;
        } catch (e) {
            return null;
        }
    },
    set(url, entry) {
        try {
            const raw = localStorage.getItem("anima-civitai-search-cache");
            let cache = raw ? JSON.parse(raw) : {};
            cache[url] = entry;
            
            // Limit entries to prevent localStorage bloat
            const keys = Object.keys(cache);
            if (keys.length > 50) {
                keys.sort((a, b) => (cache[a].timestamp || 0) - (cache[b].timestamp || 0));
                keys.slice(0, keys.length - 50).forEach(k => delete cache[k]);
            }
            localStorage.setItem("anima-civitai-search-cache", JSON.stringify(cache));
        } catch (e) {
            if (e.name === "QuotaExceededError") {
                try { localStorage.removeItem("anima-civitai-search-cache"); } catch (_) {}
            }
        }
    },
    delete(url) {
        try {
            const raw = localStorage.getItem("anima-civitai-search-cache");
            if (!raw) return;
            let cache = JSON.parse(raw);
            delete cache[url];
            localStorage.setItem("anima-civitai-search-cache", JSON.stringify(cache));
        } catch (e) {}
    }
};

function getOptimizedImageUrl(url, targetWidth = 320) {
    if (!url) return "";
    if (url.includes("civitai.com") || url.includes("civitai")) {
        if (url.includes("/width=")) {
            url = url.replace(/\/width=\d+/g, `/width=${targetWidth}`);
        } else if (url.match(/[?&]width=\d+/)) {
            url = url.replace(/width=\d+/g, `width=${targetWidth}`);
        } else {
            url += (url.includes("?") ? "&" : "?") + `width=${targetWidth}`;
        }
    }
    return url;
}

function getSkeletonHtml(count = 40) {
    let html = "";
    for (let i = 0; i < count; i++) {
        html += `
            <div class="anima-lora-card skeleton">
                <div class="anima-spinner"></div>
                <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 70px; background: linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.6) 60%, rgba(10, 10, 15, 0) 100%); z-index: 5; pointer-events: none;"></div>
            </div>
        `;
    }
    return html;
}

// ----------------- LoRA Selector Modal UI -----------------

async function openLoraSelectorModal(node) {
    // State
    let searchResults = [];
    let localLoras = [];
    let activeDownloads = {};
    let config = { custom_lora_dir: "", civitai_api_key: "" };
    
    // Favorites config
    let favoritesConfig = {
        lora: {
            groups: [{ id: "default", name: t("My Favorites"), isSystem: true }],
            items: []
        }
    };

    let query = "";
    let cursor = "";
    let isSearching = false;
    let pollInterval = null;
    
    let currentCategory = "all"; // 'all', 'style', 'character', 'clothing', 'background', 'downloaded', 'favorites'
    let currentSort = "Highest Rated"; // 'Highest Rated', 'Most Downloaded', 'Newest', 'Most Liked'
    let selectedModel = null; // Currently clicked model for previewing details
    let selectedVersion = null; // Selected version of the clicked model

    // Modal DOM setup
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "anima-lora-overlay";
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(10, 10, 15, 0.8);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #f3f4f6;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const modalContainer = document.createElement("div");
    modalContainer.id = "anima-lora-container";
    modalContainer.style.cssText = `
        width: 95%;
        max-width: 1400px;
        height: 90%;
        background: #171718;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: animaFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    `;

    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    };

    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes animaFadeIn {
            from { opacity: 0; transform: scale(0.97) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .anima-btn-primary {
            background: #0b8ce9;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .anima-btn-primary:hover {
            background: #0076c7;
        }
        .anima-btn-primary:disabled {
            background: #2d2d30;
            color: #727275;
            cursor: not-allowed;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .anima-btn-secondary {
            background: rgba(255, 255, 255, 0.08);
            color: #f3f4f6;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .anima-btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        .anima-sidebar-btn {
            background: transparent;
            border: none;
            color: #9ca3af;
            padding: 10px 14px;
            border-radius: 8px;
            text-align: left;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
        }
        .anima-sidebar-btn:hover {
            background: rgba(255, 255, 255, 0.04);
            color: #f3f4f6;
        }
        .anima-sidebar-btn.active {
            background: rgba(11, 140, 233, 0.15);
            color: #7dd3fc;
            font-weight: 600;
        }
        .anima-lora-card {
            background: #202022;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            position: relative;
            transition: all 0.2s;
            height: 280px;
            cursor: pointer;
        }
        .anima-lora-card:hover {
            transform: translateY(-4px);
            border-color: rgba(11, 140, 233, 0.4);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
        .anima-lora-card.selected {
            border-color: #0b8ce9;
            box-shadow: 0 0 12px rgba(11, 140, 233, 0.3);
            background: #232327;
        }
        .anima-lora-favorite-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9;
            color: #9ca3af;
            font-size: 13px;
            transition: all 0.2s;
            opacity: 0;
        }
        .anima-lora-card:hover .anima-lora-favorite-btn,
        .anima-lora-favorite-btn.active {
            opacity: 1;
        }
        .anima-lora-favorite-btn:hover {
            transform: scale(1.1);
            background: rgba(0, 0, 0, 0.6);
        }
        .anima-lora-favorite-btn.active {
            color: #eab308 !important;
        }
        .anima-download-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: #10b981;
            width: 0%;
            transition: width 0.2s;
        }
        .anima-lora-desc {
            font-size: 12px;
            color: #cbd5e1;
            line-height: 1.6;
            letter-spacing: 0.02em;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.3);
            padding: 12px 14px;
            border-radius: 8px;
            flex: 1;
            max-height: 260px;
            border: 1px solid rgba(255, 255, 255, 0.04);
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
        }
        .anima-lora-desc::-webkit-scrollbar {
            width: 6px;
        }
        .anima-lora-desc::-webkit-scrollbar-track {
            background: transparent;
        }
        .anima-lora-desc::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
        .anima-lora-desc::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .anima-lora-desc h1, .anima-lora-desc h2, .anima-lora-desc h3 {
            color: #7dd3fc;
            margin-top: 12px;
            margin-bottom: 6px;
            font-weight: 600;
        }
        .anima-lora-desc h1 { font-size: 14px; }
        .anima-lora-desc h2 { font-size: 13px; }
        .anima-lora-desc h3 { font-size: 12px; }
        .anima-lora-desc p {
            margin: 0 0 8px 0;
            color: #cbd5e1;
        }
        .anima-lora-desc ul, .anima-lora-desc ol {
            margin: 0 0 10px 0;
            padding-left: 18px;
        }
        .anima-lora-desc li {
            margin-bottom: 4px;
        }
        .anima-lora-desc img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px 0;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .anima-lora-desc a {
            color: #38bdf8;
            text-decoration: none;
            border-bottom: 1px dashed rgba(56, 189, 248, 0.4);
            transition: all 0.2s;
        }
        .anima-lora-desc a:hover {
            color: #0ea5e9;
            border-bottom-color: #0ea5e9;
        }
        .anima-lora-tag {
            background: rgba(11, 140, 233, 0.12);
            color: #7dd3fc;
            border: 1px solid rgba(11, 140, 233, 0.25);
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
            display: inline-block;
            margin: 2px;
            transition: background 0.2s;
        }
        .anima-lora-tag:hover {
            background: rgba(11, 140, 233, 0.25);
        }
        .anima-shimmer {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(90deg, rgba(20, 20, 30, 0.8) 25%, rgba(11, 140, 233, 0.12) 50%, rgba(20, 20, 30, 0.8) 75%) !important;
            background-size: 200% 100% !important;
            animation: animaShimmer 1.5s infinite linear !important;
            z-index: 2 !important;
            pointer-events: none !important;
        }
        .anima-lora-card.skeleton {
            background: #202022 !important;
            border-color: rgba(255, 255, 255, 0.05) !important;
            pointer-events: none !important;
            box-shadow: none !important;
        }
        #anima-lora-grid-container::-webkit-scrollbar,
        #anima-lora-detail-panel::-webkit-scrollbar {
            width: 8px;
        }
        #anima-lora-grid-container::-webkit-scrollbar-track,
        #anima-lora-detail-panel::-webkit-scrollbar-track {
            background: transparent;
        }
        #anima-lora-grid-container::-webkit-scrollbar-thumb,
        #anima-lora-detail-panel::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 4px;
        }
        #anima-lora-grid-container::-webkit-scrollbar-thumb:hover,
        #anima-lora-detail-panel::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        .anima-spinner {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: 26px !important;
            height: 26px !important;
            border: 2.5px solid rgba(11, 140, 233, 0.15) !important;
            border-top: 2.5px solid #0b8ce9 !important;
            border-radius: 50% !important;
            animation: animaSpin 0.85s infinite linear !important;
            z-index: 3 !important;
        }
        @keyframes animaShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        @keyframes animaSpin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
    `;
    document.head.appendChild(styleSheet);

    // --- Header Section ---
    const header = document.createElement("div");
    header.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-shrink: 0;
    `;

    const titleContainer = document.createElement("div");
    const title = document.createElement("h2");
    title.innerText = t("Anima LoRA Selector");
    title.style.cssText = "margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; background: linear-gradient(90deg, #7dd3fc, #0b8ce9); -webkit-background-clip: text; -webkit-text-fill-color: transparent;";
    const subTitle = document.createElement("p");
    subTitle.innerText = "Browse, download and load Anima base model LoRAs";
    subTitle.style.cssText = "margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;";
    titleContainer.appendChild(title);
    titleContainer.appendChild(subTitle);

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = t("Search Anima LoRAs...");
    searchInput.style.cssText = `
        flex: 1;
        max-width: 300px;
        background: #222225;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 10px 14px;
        color: #ffffff;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
    `;
    searchInput.onfocus = () => searchInput.style.borderColor = "#0b8ce9";
    searchInput.onblur = () => searchInput.style.borderColor = "rgba(255,255,255,0.1)";
    searchInput.onkeydown = (e) => {
        if (e.key === "Enter") {
            query = searchInput.value.trim();
            cursor = "";
            executeSearch();
        }
    };

    const filterRow = document.createElement("div");
    filterRow.style.cssText = "display: flex; align-items: center; gap: 8px;";

    // Sort Dropdown (Matching Civitai: Highest Rated, Most Downloaded, Newest, Most Liked)
    const sortSelect = document.createElement("select");
    sortSelect.style.cssText = `
        background: #222225;
        color: #fff;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 10px;
        outline: none;
        font-size: 13px;
        cursor: pointer;
    `;
    const sortOptions = [
        { val: "Highest Rated", label: "★ " + t("Uniqueness Score ⬇").replace("独特度分数", "评分最高").replace("Uniqueness Score", "Highest Rated") },
        { val: "Most Downloaded", label: "📥 " + t("Works Count ⬇").replace("作品数量", "下载最多").replace("Works Count", "Most Downloaded") },
        { val: "Newest", label: "📅 " + t("Newest").replace("Newest", "最新发布") },
        { val: "Most Liked", label: "❤️ " + t("Most Liked").replace("Most Liked", "最受欢迎") }
    ];
    sortOptions.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt.val;
        o.innerText = opt.label;
        sortSelect.appendChild(o);
    });
    sortSelect.value = currentSort;
    sortSelect.onchange = () => {
        currentSort = sortSelect.value;
        cursor = "";
        executeSearch();
    };

    filterRow.appendChild(sortSelect);

    const refreshBtn = document.createElement("button");
    refreshBtn.className = "anima-btn-secondary";
    refreshBtn.innerText = t("Refresh");
    refreshBtn.title = t("Force Refresh / 强制刷新");
    refreshBtn.style.cssText = `
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        transition: all 0.2s;
    `;
    refreshBtn.onmouseover = () => {
        refreshBtn.style.background = "rgba(255, 255, 255, 0.15)";
    };
    refreshBtn.onmouseout = () => {
        refreshBtn.style.background = "rgba(255, 255, 255, 0.08)";
    };
    refreshBtn.onclick = () => {
        executeSearch(false, true);
    };
    filterRow.appendChild(refreshBtn);

    const clearCacheBtn = document.createElement("button");
    clearCacheBtn.className = "anima-btn-secondary";
    clearCacheBtn.innerText = t("Clear Cache");
    clearCacheBtn.title = t("Clear Cache / 清除本地缓存");
    clearCacheBtn.style.cssText = `
        padding: 8px 12px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        transition: all 0.2s;
    `;
    clearCacheBtn.onmouseover = () => {
        clearCacheBtn.style.background = "rgba(255, 255, 255, 0.15)";
    };
    clearCacheBtn.onmouseout = () => {
        clearCacheBtn.style.background = "rgba(255, 255, 255, 0.08)";
    };
    clearCacheBtn.onclick = () => {
        localStorage.removeItem("anima-civitai-search-cache");
        executeSearch(false, false);
    };
    filterRow.appendChild(clearCacheBtn);

    const actionRow = document.createElement("div");
    actionRow.style.cssText = "display: flex; align-items: center; gap: 12px;";

    const settingsBtn = document.createElement("button");
    settingsBtn.innerHTML = "⚙️";
    settingsBtn.className = "anima-btn-secondary";
    settingsBtn.style.padding = "10px";
    settingsBtn.onclick = () => openSettingsModal();

    const closeBtn = document.createElement("button");
    closeBtn.innerText = t("Cancel");
    closeBtn.className = "anima-btn-secondary";
    closeBtn.onclick = closeModal;

    actionRow.appendChild(settingsBtn);
    actionRow.appendChild(closeBtn);

    header.appendChild(titleContainer);
    header.appendChild(searchInput);
    header.appendChild(filterRow);
    header.appendChild(actionRow);

    // --- Split Layout (Sidebar + List + Detail Sidebar) ---
    const modalBody = document.createElement("div");
    modalBody.style.cssText = `
        flex: 1;
        display: flex;
        overflow: hidden;
        width: 100%;
        height: 100%;
    `;

    // 1. Left Sidebar (width: 170px)
    const sidebar = document.createElement("div");
    sidebar.style.cssText = `
        width: 170px;
        background: #111112;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        padding: 16px 8px;
        gap: 6px;
        flex-shrink: 0;
    `;

    const categories = [
        { id: "all", label: t("All Artists").replace("画师", "LoRA").replace("Artists", "LoRAs"), tag: "" },
        { id: "style", label: t("Hair Color").replace("角色发色", "画风").replace("Hair Color", "Style"), tag: "style" },
        { id: "character", label: t("All Characters").replace("全部角色", "角色").replace("All Characters", "Character"), tag: "character" },
        { id: "clothing", label: t("Hair Color").replace("角色发色", "服装").replace("Hair Color", "Clothing"), tag: "clothing" },
        { id: "background", label: t("Hair Color").replace("角色发色", "背景").replace("Hair Color", "Background"), tag: "background" },
        { id: "downloaded", label: t("Download Successful").replace("成功", "已下载").replace("Successful", "Downloaded") },
        { id: "favorites", label: t("My Favorites") }
    ];

    const sidebarButtons = {};
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "anima-sidebar-btn";
        if (cat.id === currentCategory) btn.classList.add("active");
        btn.innerText = cat.label;
        btn.onclick = () => {
            if (currentCategory === cat.id) return;
            Object.values(sidebarButtons).forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = cat.id;
            cursor = "";
            executeSearch();
        };
        sidebar.appendChild(btn);
        sidebarButtons[cat.id] = btn;
    });

    // 2. Center List Content Area
    const contentArea = document.createElement("div");
    contentArea.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        height: 100%;
    `;

    const gridContainer = document.createElement("div");
    gridContainer.id = "anima-lora-grid-container";
    gridContainer.style.cssText = `
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        scrollbar-gutter: stable;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 20px;
        align-content: start;
    `;

    // Center Footer
    const footer = document.createElement("div");
    footer.style.cssText = `
        padding: 16px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
    `;

    const infoText = document.createElement("span");
    infoText.style.cssText = "font-size: 13px; color: #9ca3af;";
    
    const pagButtons = document.createElement("div");
    pagButtons.style.cssText = "display: flex; gap: 8px;";

    const nextBtn = document.createElement("button");
    nextBtn.innerText = t("Next");
    nextBtn.className = "anima-btn-primary";
    nextBtn.disabled = true;
    nextBtn.onclick = () => {
        if (cursor) {
            executeSearch(true);
        }
    };

    pagButtons.appendChild(nextBtn);
    footer.appendChild(infoText);
    footer.appendChild(pagButtons);

    contentArea.appendChild(gridContainer);
    contentArea.appendChild(footer);

    // 3. Right Detail Panel Sidebar (width: 340px)
    const detailPanel = document.createElement("div");
    detailPanel.id = "anima-lora-detail-panel";
    detailPanel.style.cssText = `
        width: 340px;
        background: #1a1a1c;
        border-left: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 14px;
        overflow-y: auto;
        scrollbar-gutter: stable;
        flex-shrink: 0;
    `;

    // Render empty state initially
    renderDetailEmptyState();

    modalBody.appendChild(sidebar);
    modalBody.appendChild(contentArea);
    modalBody.appendChild(detailPanel);

    modalContainer.appendChild(header);
    modalContainer.appendChild(modalBody);
    modalOverlay.appendChild(modalContainer);
    document.body.appendChild(modalOverlay);

    // Render skeleton placeholders initially before async data loads
    gridContainer.innerHTML = getSkeletonHtml(40);

    // Start background asynchronous data fetch
    setTimeout(async () => {
        try {
            const promises = [];
            if (!globalLoraConfig) {
                promises.push(fetch("/anima-tools/lora/config").then(r => r.ok ? r.json() : null).then(data => {
                    if (data) globalLoraConfig = data;
                }));
            }
            if (!globalLocalLoras) {
                promises.push(fetch("/anima-tools/lora/local").then(r => r.ok ? r.json() : null).then(data => {
                    if (data) globalLocalLoras = data;
                }));
            }
            if (!globalFavorites) {
                promises.push(fetch("/anima-tools/favorites").then(r => r.ok ? r.json() : null).then(data => {
                    if (data) globalFavorites = data;
                }));
            }
            promises.push(fetch("/anima-tools/lora/download-status").then(r => r.ok ? r.json() : null).then(data => {
                if (data) activeDownloads = data;
            }));

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            if (globalLoraConfig) config = globalLoraConfig;
            if (globalLocalLoras) localLoras = globalLocalLoras;
            if (globalFavorites && globalFavorites.lora) {
                favoritesConfig.lora = globalFavorites.lora;
            }
        } catch (e) {
            console.error("[Anima Tools] Failed to initialize data", e);
        }

        // Once initial data is ready, run first search query
        executeSearch();

        // Start polling download status
        pollInterval = setInterval(updateDownloadsProgress, 1000);
    }, 50);

    // Close Handler
    function closeModal() {
        if (pollInterval) clearInterval(pollInterval);
        document.head.removeChild(styleSheet);
        modalOverlay.remove();
    }

    // --- Search Execution ---
    async function executeSearch(loadNext = false, forceRefresh = false) {
        if (isSearching) return;
        isSearching = true;
        
        gridContainer.innerHTML = getSkeletonHtml(40);
        infoText.innerText = "Querying...";
        
        // Clear selected state
        selectedModel = null;
        selectedVersion = null;
        renderDetailEmptyState();

        if (currentCategory === "downloaded") {
            isSearching = false;
            nextBtn.disabled = true;
            renderDownloadedOnly();
            return;
        }

        if (currentCategory === "favorites") {
            isSearching = false;
            nextBtn.disabled = true;
            renderFavoritesOnly();
            return;
        }

        // Get matching tag for Civitai
        const activeCat = categories.find(c => c.id === currentCategory);
        const activeTag = activeCat ? activeCat.tag : "";

        let searchUrl = `/anima-tools/lora/search?query=${encodeURIComponent(query)}&tag=${encodeURIComponent(activeTag)}&sort=${encodeURIComponent(currentSort)}&limit=40`;
        if (loadNext && cursor) {
            searchUrl += `&cursor=${encodeURIComponent(cursor)}`;
        }

        // Check Civitai Search cache (24 hours TTL for long-term cache)
        const CACHE_TTL = 24 * 60 * 60 * 1000;
        if (forceRefresh) {
            civitaiSearchCache.delete(searchUrl);
        }
        const cached = civitaiSearchCache.get(searchUrl);
        if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            searchResults = cached.data.items || [];
            cursor = (cached.data.metadata && cached.data.metadata.nextCursor) ? cached.data.metadata.nextCursor : "";
            renderGrid();
            nextBtn.disabled = !cursor;
            infoText.innerText = `Found ${searchResults.length} Anima models (Cached).`;
            isSearching = false;
            return;
        }

        try {
            const resp = await fetch(searchUrl);
            if (resp.ok) {
                const data = await resp.json();
                civitaiSearchCache.set(searchUrl, { data: data, timestamp: Date.now() });
                searchResults = data.items || [];
                cursor = (data.metadata && data.metadata.nextCursor) ? data.metadata.nextCursor : "";
                
                renderGrid();
                
                nextBtn.disabled = !cursor;
                infoText.innerText = `Found ${searchResults.length} Anima models on this page.`;
            } else {
                gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">Failed to load data from server.</div>`;
            }
        } catch (e) {
            console.error(e);
            gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 40px;">Network error occurred.</div>`;
        } finally {
            isSearching = false;
        }
    }

    // --- Grid Rendering ---
    function renderGrid() {
        gridContainer.innerHTML = "";
        
        if (searchResults.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 40px;">${t("No Anima LoRAs found")}</div>`;
            return;
        }

        for (const model of searchResults) {
            const card = document.createElement("div");
            card.className = "anima-lora-card";
            if (selectedModel && String(selectedModel.id) === String(model.id)) {
                card.classList.add("selected");
            }

            const versions = model.modelVersions || [];
            const firstVersion = versions[0] || {};
            const files = firstVersion.files || [];
            const safetensorFile = files.find(f => f.name.endsWith(".safetensors")) || files[0] || {};
            const filename = safetensorFile.name || `${model.name}.safetensors`;

            // Card Image
            const imgContainer = document.createElement("div");
            imgContainer.style.cssText = "width: 100%; height: 100%; background: transparent; overflow: hidden; position: relative; flex: 1;";
            
            let previewUrl = "";
            let isVideo = false;
            const localPath = localLoras.find(l => l === filename || l.endsWith(filename));
            const isLocal = !!localPath;
            if (isLocal) {
                previewUrl = `/anima-tools/lora/local-preview?filename=${encodeURIComponent(localPath)}`;
            } else {
                const images = firstVersion.images || [];
                if (images.length > 0) {
                    previewUrl = images[0].url || "";
                    if (images[0].type === "video" || (previewUrl && (previewUrl.toLowerCase().includes(".mp4") || previewUrl.toLowerCase().includes(".webm") || previewUrl.toLowerCase().includes(".ogv")))) {
                        isVideo = true;
                    }
                    if (!isVideo && previewUrl) {
                        previewUrl = getOptimizedImageUrl(previewUrl, 320);
                    }
                    if (previewUrl && config.civitai_api_key) {
                        previewUrl += (previewUrl.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(config.civitai_api_key);
                    }
                }
            }
            
            const mediaElement = isVideo ? document.createElement("video") : document.createElement("img");
            mediaElement.style.cssText = "width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
            
            if (isVideo) {
                mediaElement.muted = true;
                mediaElement.loop = true;
                mediaElement.playsInline = true;
                mediaElement.autoplay = true;
                mediaElement.controls = false;
            } else {
                mediaElement.loading = "lazy";
            }
            
            let loader = null;
            if (previewUrl) {
                mediaElement.src = previewUrl;
                if (isVideo) {
                    loader = document.createElement("div");
                    const spinner = document.createElement("div");
                    spinner.className = "anima-spinner";
                    loader.appendChild(spinner);
                    imgContainer.appendChild(loader);
                    
                    mediaElement.onloadeddata = () => {
                        mediaElement.style.opacity = "1";
                        loader?.remove();
                    };
                    mediaElement.onerror = () => {
                        mediaElement.style.display = "none";
                        loader?.remove();
                        const fallback = document.createElement("img");
                        fallback.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
                        fallback.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
                        imgContainer.appendChild(fallback);
                    };
                } else {
                    if (mediaElement.complete && mediaElement.naturalWidth !== 0) {
                        mediaElement.style.opacity = "1";
                    } else {
                        loader = document.createElement("div");
                        const spinner = document.createElement("div");
                        spinner.className = "anima-spinner";
                        loader.appendChild(spinner);
                        imgContainer.appendChild(loader);
                    }
                    
                    mediaElement.onload = () => {
                        mediaElement.style.opacity = "1";
                        loader?.remove();
                    };
                    mediaElement.onerror = () => {
                        mediaElement.style.display = "none";
                        loader?.remove();
                        const fallback = document.createElement("img");
                        fallback.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
                        fallback.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
                        imgContainer.appendChild(fallback);
                    };
                }
            } else {
                mediaElement.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
                mediaElement.style.opacity = "1";
            }
            
            card.onmouseenter = () => {
                mediaElement.style.transform = "scale(1.06)";
            };
            card.onmouseleave = () => {
                mediaElement.style.transform = "scale(1)";
            };
            imgContainer.appendChild(mediaElement);

            // Download progress bar
            const dlBar = document.createElement("div");
            dlBar.className = "anima-download-bar";
            dlBar.id = `dl-bar-${firstVersion.id}`;
            imgContainer.appendChild(dlBar);
            
            const activeJob = activeDownloads[firstVersion.id];
            if (activeJob && (activeJob.status === "pending" || activeJob.status === "downloading")) {
                const percent = activeJob.total ? Math.round((activeJob.progress / activeJob.total) * 100) : 0;
                dlBar.style.width = `${percent}%`;
            }

            // Floating Star Button (Favorites)
            const favBtn = document.createElement("div");
            favBtn.className = "anima-lora-favorite-btn";
            favBtn.style.zIndex = "8";
            const isFav = favoritesConfig.lora.items.some(item => String(item.id) === String(model.id));
            if (isFav) {
                favBtn.classList.add("active");
                favBtn.innerHTML = "★";
            } else {
                favBtn.innerHTML = "☆";
            }
            favBtn.onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(model, favBtn);
            };
            imgContainer.appendChild(favBtn);

            // Local status overlay dot
            if (isLocal) {
                const statusDot = document.createElement("div");
                statusDot.style.cssText = "position: absolute; top: 8px; left: 8px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #202022; z-index: 8;";
                statusDot.title = "Downloaded";
                imgContainer.appendChild(statusDot);
            }

            // Card Body Info (Floating text metadata with gradient overlay)
            const body = document.createElement("div");
            body.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.6) 60%, rgba(10, 10, 15, 0) 100%);
                padding: 40px 12px 12px 12px;
                display: flex;
                flex-direction: column;
                gap: 2px;
                overflow: hidden;
                box-sizing: border-box;
                z-index: 5;
                pointer-events: none;
            `;
            
            const modelName = document.createElement("div");
            modelName.innerText = model.name || "Unnamed Model";
            modelName.style.cssText = "font-size: 12px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 4px rgba(0,0,0,0.85);";
            
            const author = document.createElement("div");
            author.innerText = `by ${model.creator?.username || "Unknown"}`;
            author.style.cssText = "font-size: 10px; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 3px rgba(0,0,0,0.85);";
            
            body.appendChild(modelName);
            body.appendChild(author);

            card.appendChild(imgContainer);
            card.appendChild(body);
            
            // Onclick: Preview Details in right sidebar
            card.onclick = () => {
                // Remove selected borders from other cards
                const allCards = gridContainer.querySelectorAll(".anima-lora-card");
                allCards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");
                
                selectedModel = model;
                selectedVersion = firstVersion;
                renderModelDetail();
            };

            gridContainer.appendChild(card);
        }
    }

    // --- Render Model Detail Panel (Right Sidebar) ---
    function renderModelDetail() {
        if (!selectedModel || !selectedVersion) {
            renderDetailEmptyState();
            return;
        }

        detailPanel.innerHTML = "";

        // 1. Big Preview Image
        const imgContainer = document.createElement("div");
        imgContainer.style.cssText = "width: 100%; height: 180px; border-radius: 10px; background: #000; overflow: hidden; position: relative; flex-shrink: 0;";
        
        let previewUrl = "";
        let isVideo = false;
        
        const files = selectedVersion.files || [];
        const safetensorFile = files.find(f => f.name.endsWith(".safetensors")) || files[0] || {};
        const filename = safetensorFile.name || `${selectedModel.name}.safetensors`;
        const localPath = localLoras.find(l => l === filename || l.endsWith(filename));
        const isLocal = !!localPath;

        const modelId = selectedModel.id;
        const isCivitaiModel = modelId && !isNaN(Number(modelId)) && !String(modelId).endsWith(".safetensors");

        if (isLocal) {
            previewUrl = `/anima-tools/lora/local-preview?filename=${encodeURIComponent(localPath)}`;
        } else {
            const images = selectedVersion.images || [];
            if (images.length > 0) {
                previewUrl = images[0].url || "";
                if (images[0].type === "video" || (previewUrl && (previewUrl.toLowerCase().includes(".mp4") || previewUrl.toLowerCase().includes(".webm") || previewUrl.toLowerCase().includes(".ogv")))) {
                    isVideo = true;
                }
                if (!isVideo && previewUrl) {
                    previewUrl = getOptimizedImageUrl(previewUrl, 768);
                }
                if (previewUrl && config.civitai_api_key) {
                    previewUrl += (previewUrl.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(config.civitai_api_key);
                }
            }
        }
        
        const mediaElement = isVideo ? document.createElement("video") : document.createElement("img");
        mediaElement.style.cssText = "width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; opacity: 0; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
        
        if (isVideo) {
            mediaElement.muted = true;
            mediaElement.loop = true;
            mediaElement.playsInline = true;
            mediaElement.autoplay = true;
            mediaElement.controls = false;
        }
        
        if (previewUrl) {
            mediaElement.onclick = () => window.open(previewUrl, "_blank");
        }
        
        let loader = null;
        if (previewUrl) {
            mediaElement.src = previewUrl;
            if (isVideo) {
                loader = document.createElement("div");
                const spinner = document.createElement("div");
                spinner.className = "anima-spinner";
                loader.appendChild(spinner);
                imgContainer.appendChild(loader);
                
                mediaElement.onloadeddata = () => {
                    mediaElement.style.opacity = "1";
                    loader?.remove();
                };
                mediaElement.onerror = () => {
                    mediaElement.style.display = "none";
                    loader?.remove();
                    const fallback = document.createElement("img");
                    fallback.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
                    fallback.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
                    imgContainer.appendChild(fallback);
                };
            } else {
                if (mediaElement.complete && mediaElement.naturalWidth !== 0) {
                    mediaElement.style.opacity = "1";
                } else {
                    loader = document.createElement("div");
                    const spinner = document.createElement("div");
                    spinner.className = "anima-spinner";
                    loader.appendChild(spinner);
                    imgContainer.appendChild(loader);
                }
                
                mediaElement.onload = () => {
                    mediaElement.style.opacity = "1";
                    loader?.remove();
                };
                mediaElement.onerror = () => {
                    if (!isCivitaiModel) {
                        mediaElement.remove();
                        
                        const video = document.createElement("video");
                        video.style.cssText = "width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; opacity: 0; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
                        video.muted = true;
                        video.loop = true;
                        video.playsInline = true;
                        video.autoplay = true;
                        video.controls = false;
                        video.src = previewUrl;
                        video.onclick = () => window.open(previewUrl, "_blank");
                        
                        video.onloadeddata = () => {
                            video.style.opacity = "1";
                            loader?.remove();
                        };
                        video.onerror = () => {
                            video.remove();
                            loader?.remove();
                            const fallback = document.createElement("img");
                            fallback.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
                            fallback.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
                            imgContainer.appendChild(fallback);
                        };
                        imgContainer.appendChild(video);
                    } else {
                        mediaElement.style.display = "none";
                        loader?.remove();
                        const fallback = document.createElement("img");
                        fallback.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
                        fallback.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
                        imgContainer.appendChild(fallback);
                    }
                };
            }
        } else {
            mediaElement.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23222'/><text x='50%' y='50%' font-size='10' fill='%23666' dominant-baseline='middle' text-anchor='middle'>No Preview</text></svg>";
            mediaElement.style.opacity = "1";
        }
        imgContainer.appendChild(mediaElement);

        // 2. Info Row
        const titleRow = document.createElement("div");
        titleRow.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
        
        const titleText = document.createElement(isCivitaiModel ? "a" : "div");
        titleText.innerText = selectedModel.name;
        
        if (isCivitaiModel) {
            titleText.href = `https://civitai.com/models/${modelId}`;
            titleText.target = "_blank";
            titleText.title = "View on Civitai / 在 C 站查看";
            titleText.style.cssText = "font-size: 16px; font-weight: 700; color: #fff; line-height: 1.3; text-decoration: none; display: inline-flex; align-items: center; transition: color 0.2s;";
            
            // Add SVG external link icon
            const iconSpan = document.createElement("span");
            iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 5px; display: inline-block; transition: stroke 0.2s;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
            titleText.appendChild(iconSpan);
            
            titleText.onmouseenter = () => {
                titleText.style.color = "#38bdf8";
                const svg = iconSpan.querySelector("svg");
                if (svg) svg.setAttribute("stroke", "#38bdf8");
            };
            titleText.onmouseleave = () => {
                titleText.style.color = "#fff";
                const svg = iconSpan.querySelector("svg");
                if (svg) svg.setAttribute("stroke", "#9ca3af");
            };
        } else {
            titleText.style.cssText = "font-size: 16px; font-weight: 700; color: #fff; line-height: 1.3; cursor: default;";
        }
        
        const authorText = document.createElement("div");
        authorText.innerText = `by ${selectedModel.creator?.username || "Unknown"}`;
        authorText.style.cssText = "font-size: 11px; color: #9ca3af;";
        
        titleRow.appendChild(titleText);
        titleRow.appendChild(authorText);

        // 3. Version Select Dropdown
        const verContainer = document.createElement("div");
        verContainer.style.cssText = "display: flex; flex-direction: column; gap: 6px;";
        
        const verLabel = document.createElement("div");
        verLabel.innerText = "Versions / 模型版本:";
        verLabel.style.cssText = "font-size: 11px; color: #9ca3af; font-weight: 600;";
        
        const verSelect = document.createElement("select");
        verSelect.style.cssText = `
            background: #252528;
            color: #fff;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 8px;
            font-size: 12px;
            outline: none;
            cursor: pointer;
        `;
        const versions = selectedModel.modelVersions || [];
        versions.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.id;
            opt.innerText = v.name || "Unnamed Version";
            if (String(v.id) === String(selectedVersion.id)) {
                opt.selected = true;
            }
            verSelect.appendChild(opt);
        });
        verSelect.onchange = () => {
            const vId = verSelect.value;
            const match = versions.find(v => String(v.id) === String(vId));
            if (match) {
                selectedVersion = match;
                renderModelDetail();
            }
        };
        verContainer.appendChild(verLabel);
        verContainer.appendChild(verSelect);

        // 4. Action Button (Download / Add)
        const actionContainer = document.createElement("div");
        actionContainer.style.cssText = "display: flex; flex-direction: column; gap: 8px; margin-top: 6px; flex-shrink: 0;";

        const downloadUrl = selectedVersion.downloadUrl || "";
        const activeJob = activeDownloads[selectedVersion.id];

        const actionBtn = document.createElement("button");
        actionBtn.className = "anima-btn-primary";
        actionBtn.style.padding = "12px";
        actionBtn.style.fontSize = "13px";
        actionBtn.style.width = "100%";

        if (isLocal) {
            const alreadyInNode = node._loraData.some(l => l.name === filename || l.name.endsWith(filename));
            if (alreadyInNode) {
                actionBtn.innerText = t("Already Added");
                actionBtn.style.background = "rgba(16, 185, 129, 0.15)";
                actionBtn.style.color = "#10b981";
                actionBtn.style.border = "1px solid rgba(16, 185, 129, 0.3)";
                actionBtn.disabled = true;
            } else {
                actionBtn.innerText = "➕ " + t("Add");
                actionBtn.style.background = "#10b981";
                actionBtn.style.color = "#fff";
                actionBtn.onclick = () => {
                    addLoraToNode(filename);
                    renderModelDetail();
                    // Refilter if on local grids
                    if (currentCategory === "downloaded") {
                        renderDownloadedOnly();
                    } else if (currentCategory === "favorites") {
                        renderFavoritesOnly();
                    } else {
                        renderGrid();
                    }
                };
            }
        } else if (activeJob && (activeJob.status === "pending" || activeJob.status === "downloading")) {
            const percent = activeJob.total ? Math.round((activeJob.progress / activeJob.total) * 100) : 0;
            actionBtn.innerText = t("Downloading... {progress}%", { progress: percent });
            actionBtn.style.background = "rgba(11, 140, 233, 0.2)";
            actionBtn.style.color = "#7dd3fc";
            actionBtn.style.border = "1px solid rgba(11, 140, 233, 0.3)";
            actionBtn.disabled = true;
        } else {
            actionBtn.innerText = "📥 " + t("Download & Add");
            actionBtn.style.background = "#0b8ce9";
            actionBtn.style.color = "#fff";
            actionBtn.onclick = () => {
                startDownload(selectedVersion.id, downloadUrl, filename, actionBtn, null);
            };
        }
        actionContainer.appendChild(actionBtn);

        // 5. Trigger Words (if any)
        const triggers = selectedVersion.trainedWords || [];
        const triggerContainer = document.createElement("div");
        triggerContainer.style.cssText = "display: flex; flex-direction: column; gap: 6px;";
        
        const triggerLabel = document.createElement("div");
        triggerLabel.innerText = "Trigger Words / 触发词:";
        triggerLabel.style.cssText = "font-size: 11px; color: #9ca3af; font-weight: 600;";
        triggerContainer.appendChild(triggerLabel);

        if (triggers.length > 0) {
            const listDiv = document.createElement("div");
            listDiv.style.cssText = "max-height: 80px; overflow-y: auto; border: 1px solid rgba(255,255,255,0.03); padding: 4px; border-radius: 6px;";
            triggers.forEach(word => {
                const tag = document.createElement("span");
                tag.className = "anima-lora-tag";
                tag.innerText = word;
                tag.title = "Click to copy";
                tag.onclick = () => {
                    navigator.clipboard.writeText(word);
                    alert(`Copied: ${word}`);
                };
                listDiv.appendChild(tag);
            });
            triggerContainer.appendChild(listDiv);
        } else {
            const noneDiv = document.createElement("div");
            noneDiv.innerText = "None / 无需触发词";
            noneDiv.style.cssText = "font-size: 12px; color: #666; font-style: italic;";
            triggerContainer.appendChild(noneDiv);
        }

        // 6. Model Description (Rich Text Description)
        const descContainer = document.createElement("div");
        descContainer.style.cssText = "display: flex; flex-direction: column; gap: 6px; flex: 1; min-height: 0;";
        
        const descLabel = document.createElement("div");
        descLabel.innerText = "Description / 模型介绍:";
        descLabel.style.cssText = "font-size: 11px; color: #9ca3af; font-weight: 600; flex-shrink: 0;";
        
        const descBody = document.createElement("div");
        descBody.className = "anima-lora-desc";
        
        let descHtml = selectedModel.description || selectedVersion.description || "";
        if (descHtml) {
            // Clean up description if needed, render innerHTML
            descBody.innerHTML = descHtml;
        } else {
            descBody.innerHTML = `<span style="color: #666; font-style: italic;">No description provided.</span>`;
        }
        
        descContainer.appendChild(descLabel);
        descContainer.appendChild(descBody);

        detailPanel.appendChild(imgContainer);
        detailPanel.appendChild(titleRow);
        detailPanel.appendChild(verContainer);
        detailPanel.appendChild(actionContainer);
        detailPanel.appendChild(triggerContainer);
        detailPanel.appendChild(descContainer);
    }

    function renderDetailEmptyState() {
        detailPanel.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #555; text-align: center; gap: 10px; padding: 20px;">
                <div style="font-size: 40px;">🔍</div>
                <div style="font-size: 13px; font-weight: 600; color: #888;">Select a LoRA card</div>
                <div style="font-size: 11px; color: #555; line-height: 1.4;">Click any LoRA on the left grid to view version files, trigger words, and read full description.</div>
            </div>
        `;
    }

    // --- Render Downloaded Only (Local List) ---
    function renderDownloadedOnly() {
        gridContainer.innerHTML = "";
        
        const filteredLocal = localLoras.filter(name => {
            const q = query.toLowerCase();
            return !q || name.toLowerCase().includes(q);
        });

        if (filteredLocal.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 40px;">No downloaded LoRAs found</div>`;
            infoText.innerText = "No local models matched.";
            return;
        }

        for (const filename of filteredLocal) {
            const card = document.createElement("div");
            card.className = "anima-lora-card";
            if (selectedModel && selectedModel.id === filename) {
                card.classList.add("selected");
            }

            const imgContainer = document.createElement("div");
            imgContainer.style.cssText = "width: 100%; height: 100%; background: transparent; overflow: hidden; position: relative; flex: 1; display: flex; align-items: center; justify-content: center;";
            
            const img = document.createElement("img");
            img.style.cssText = "width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
            img.loading = "lazy";
            
            let loader = null;
            const previewUrl = `/anima-tools/lora/local-preview?filename=${encodeURIComponent(filename)}`;
            img.src = previewUrl;
            
            loader = document.createElement("div");
            const spinner = document.createElement("div");
            spinner.className = "anima-spinner";
            loader.appendChild(spinner);
            imgContainer.appendChild(loader);
            
            if (img.complete && img.naturalWidth !== 0) {
                img.style.opacity = "1";
                loader?.remove();
            }
            
            img.onload = () => {
                img.style.opacity = "1";
                loader?.remove();
            };
            img.onerror = () => {
                img.remove();
                
                const video = document.createElement("video");
                video.style.cssText = "width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);";
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.autoplay = true;
                video.controls = false;
                video.src = previewUrl;
                
                video.onloadeddata = () => {
                    video.style.opacity = "1";
                    loader?.remove();
                };
                video.onerror = () => {
                    video.remove();
                    loader?.remove();
                    const fallback = document.createElement("div");
                    fallback.innerText = "📦";
                    fallback.style.cssText = "font-size: 48px; color: #555;";
                    imgContainer.appendChild(fallback);
                };
                
                card.onmouseenter = () => {
                    video.style.transform = "scale(1.06)";
                };
                card.onmouseleave = () => {
                    video.style.transform = "scale(1)";
                };
                imgContainer.appendChild(video);
            };
            
            card.onmouseenter = () => {
                img.style.transform = "scale(1.06)";
            };
            card.onmouseleave = () => {
                img.style.transform = "scale(1)";
            };
            imgContainer.appendChild(img);

            // Card delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "🗑️";
            deleteBtn.title = t("Delete Model / 删除模型");
            deleteBtn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #ef4444;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
                transition: all 0.2s;
                opacity: 0;
            `;
            
            deleteBtn.onmouseenter = () => {
                deleteBtn.style.background = "#ef4444";
                deleteBtn.style.color = "#ffffff";
                deleteBtn.style.transform = "scale(1.1)";
            };
            deleteBtn.onmouseleave = () => {
                deleteBtn.style.background = "rgba(0, 0, 0, 0.6)";
                deleteBtn.style.color = "#ef4444";
                deleteBtn.style.transform = "scale(1)";
            };
            
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                const confirmed = confirm(
                    t("Are you sure you want to delete this model and its metadata? This action CANNOT be undone.\n确认要从磁盘中永久删除此模型及所有伴随文件吗？此操作不可撤销。")
                );
                
                if (!confirmed) return;
                
                deleteBtn.disabled = true;
                deleteBtn.innerHTML = "⏳";
                
                try {
                    const resp = await fetch("/anima-tools/lora/delete-local", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ filename: filename })
                    });
                    
                    if (resp.ok) {
                        localLoras = localLoras.filter(l => l !== filename);
                        globalLocalLoras = localLoras;
                        
                        let isCurrentSelectedDeleted = false;
                        if (selectedModel) {
                            if (selectedModel.id === filename || selectedModel.local_filename === filename) {
                                isCurrentSelectedDeleted = true;
                            }
                            const sFiles = selectedVersion?.files || [];
                            if (sFiles.some(f => f.name === filename || f.name.endsWith(filename))) {
                                isCurrentSelectedDeleted = true;
                            }
                        }
                        if (isCurrentSelectedDeleted) {
                            selectedModel = null;
                            selectedVersion = null;
                            renderDetailEmptyState();
                        }
                        
                        renderDownloadedOnly();
                    } else {
                        const err = await resp.json();
                        alert(`Failed to delete model: ${err.error || "Unknown error"}`);
                        deleteBtn.disabled = false;
                        deleteBtn.innerHTML = "🗑️";
                    }
                } catch (error) {
                    console.error("Delete local lora failed", error);
                    alert("Network error. Failed to delete model.");
                    deleteBtn.disabled = false;
                    deleteBtn.innerHTML = "🗑️";
                }
            };
            
            imgContainer.appendChild(deleteBtn);

            card.onmouseenter = () => {
                img.style.transform = "scale(1.06)";
                deleteBtn.style.opacity = "1";
            };
            card.onmouseleave = () => {
                img.style.transform = "scale(1)";
                deleteBtn.style.opacity = "0";
            };

            // Floating Local Dot
            const statusDot = document.createElement("div");
            statusDot.style.cssText = "position: absolute; top: 8px; left: 8px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #202022; z-index: 8;";
            imgContainer.appendChild(statusDot);

            // Card Body Info (Floating text metadata with gradient overlay)
            const body = document.createElement("div");
            body.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(to top, rgba(10, 10, 15, 0.95) 0%, rgba(10, 10, 15, 0.6) 60%, rgba(10, 10, 15, 0) 100%);
                padding: 40px 12px 12px 12px;
                display: flex;
                flex-direction: column;
                gap: 2px;
                overflow: hidden;
                box-sizing: border-box;
                z-index: 5;
                pointer-events: none;
            `;
            
            const modelName = document.createElement("div");
            modelName.style.cssText = "font-size: 12px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 4px rgba(0,0,0,0.85);";
            
            let displayName = filename;
            if (displayName.endsWith(".safetensors")) {
                displayName = displayName.slice(0, -12);
            }
            const lastSlash = Math.max(displayName.lastIndexOf("/"), displayName.lastIndexOf("\\"));
            if (lastSlash !== -1) {
                displayName = displayName.substring(lastSlash + 1);
            }
            modelName.innerText = displayName;
            modelName.title = filename;
            
            const localPathLabel = document.createElement("div");
            localPathLabel.innerText = "Local SafeTensor";
            localPathLabel.style.cssText = "font-size: 10px; color: #10b981; text-shadow: 0 1px 3px rgba(0,0,0,0.85);";

            // 异步请求本地 LoRA 元数据（后端会自动进行哈希反查与自动补齐伴随数据）
            fetch(`/anima-tools/lora/local-metadata?filename=${encodeURIComponent(filename)}`)
                .then(r => r.ok ? r.json() : null)
                .then(res => {
                    if (res && res.success && res.metadata) {
                        const meta = res.metadata;
                        const mName = meta.model?.name;
                        const mCreator = meta.model?.creator?.username;
                        if (mName) {
                            modelName.innerText = mName;
                            modelName.title = mName;
                        }
                        if (mCreator) {
                            localPathLabel.innerText = `by ${mCreator}`;
                            localPathLabel.style.color = "#cbd5e1";
                        }
                        
                        // 自动同步 C 站封面，如果本地预览还在下载或者不可用
                        const images = meta.version?.images || [];
                        if (images.length > 0 && (!img.src || img.src.includes("local-preview") && img.style.opacity === "0")) {
                            let webUrl = images[0].url;
                            if (webUrl) {
                                webUrl = getOptimizedImageUrl(webUrl, 320);
                                if (config.civitai_api_key) {
                                    webUrl += (webUrl.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(config.civitai_api_key);
                                }
                                img.src = webUrl;
                            }
                        }
                    }
                })
                .catch(err => console.error("[Anima Tools] Error lazy-loading card metadata:", err));

            body.appendChild(modelName);
            body.appendChild(localPathLabel);
            card.appendChild(imgContainer);
            card.appendChild(body);
            
            // Click Local Card
            card.onclick = async () => {
                const allCards = gridContainer.querySelectorAll(".anima-lora-card");
                allCards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");

                // Pre-fill with a mock model version in case fetch fails or meta is absent
                selectedModel = { id: filename, name: filename, description: "This is a locally available LoRA model file." };
                selectedVersion = {
                    id: filename,
                    name: "Local version",
                    trainedWords: [],
                    files: [{ name: filename }],
                    downloadUrl: ""
                };
                renderModelDetail();

                try {
                    const resp = await fetch(`/anima-tools/lora/local-metadata?filename=${encodeURIComponent(filename)}`);
                    if (resp.ok) {
                        const resData = await resp.json();
                        if (resData.success && resData.metadata) {
                            selectedModel = resData.metadata.model;
                            selectedVersion = resData.metadata.version;
                            selectedModel.local_filename = filename;
                            selectedVersion.local_filename = filename;
                            renderModelDetail();
                        }
                    }
                } catch (e) {
                    console.error("[Anima Tools] Failed to fetch local model metadata", e);
                }
            };

            gridContainer.appendChild(card);
        }

        infoText.innerText = `Found ${filteredLocal.length} local LoRAs.`;
    }

    // --- Render Favorites Only ---
    function renderFavoritesOnly() {
        gridContainer.innerHTML = "";
        
        let filteredFavs = favoritesConfig.lora.items.filter(model => {
            const q = query.toLowerCase();
            return !q || model.name.toLowerCase().includes(q) || (model.creator && model.creator.username.toLowerCase().includes(q));
        });

        if (filteredFavs.length === 0) {
            gridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #9ca3af; padding: 40px;">No favorite LoRAs found</div>`;
            infoText.innerText = "No favorite models matched.";
            return;
        }

        searchResults = filteredFavs;
        renderGrid();
        infoText.innerText = `Showing ${filteredFavs.length} favorite LoRAs.`;
    }

    // --- Action Methods ---
    async function startDownload(versionId, downloadUrl, filename, btnElement, barElement) {
        if (!downloadUrl) {
            alert("No download URL available for this model.");
            return;
        }

        btnElement.innerText = t("Downloading... {progress}%", { progress: 0 });
        btnElement.style.background = "rgba(11, 140, 233, 0.2)";
        btnElement.style.color = "#7dd3fc";
        btnElement.style.border = "1px solid rgba(11, 140, 233, 0.3)";
        btnElement.disabled = true;

        try {
            const resp = await fetch("/anima-tools/lora/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    version_id: versionId,
                    download_url: downloadUrl,
                    filename: filename,
                    metadata: {
                        model: selectedModel,
                        version: selectedVersion
                    }
                })
            });

            if (resp.ok) {
                activeDownloads[versionId] = {
                    status: "downloading",
                    progress: 0,
                    total: 0
                };
            } else {
                alert("Failed to start download task.");
                renderModelDetail();
            }
        } catch (e) {
            console.error(e);
            alert("Network error starting download.");
            renderModelDetail();
        }
    }

    async function updateDownloadsProgress() {
        try {
            const resp = await fetch("/anima-tools/lora/download-status");
            if (!resp.ok) return;

            const jobs = await resp.json();
            activeDownloads = jobs;

            let needGridRebuild = false;

            for (const [task_id, job] of Object.entries(jobs)) {
                const bar = document.getElementById(`dl-bar-${task_id}`);
                const percent = job.total ? Math.round((job.progress / job.total) * 100) : 0;
                
                if (bar) {
                    bar.style.width = `${percent}%`;
                }

                if (job.status === "completed") {
                    const filename = job.save_path ? job.save_path.split(/[/\\]/).pop() : "";
                    if (filename && !localLoras.includes(filename)) {
                        localLoras.push(filename);
                        globalLocalLoras = localLoras;
                        needGridRebuild = true;
                    }
                    delete activeDownloads[task_id];
                } else if (job.status === "failed") {
                    console.error(`Download failed for task ${task_id}: ${job.error}`);
                    if (job.error && job.error.includes("401")) {
                        alert(`【下载失败】此模型需要 Civitai API Key 才能下载。\n请点击界面右上角的 ⚙️ (齿轮) 按钮配置你的 API Key 后再试。`);
                    } else {
                        alert(`Download failed for model version ${task_id}. Error: ${job.error}`);
                    }
                    delete activeDownloads[task_id];
                    needGridRebuild = true;
                }
            }

            // If we are currently viewing the downloading model details, refresh details view
            if (selectedVersion && activeDownloads[selectedVersion.id]) {
                needGridRebuild = true;
            }

            if (needGridRebuild || Object.keys(jobs).length > 0) {
                if (currentCategory === "downloaded") {
                    renderDownloadedOnly();
                } else if (currentCategory === "favorites") {
                    renderFavoritesOnly();
                } else {
                    renderGrid();
                }
                
                // Refresh detail pane if selection is active
                if (selectedModel) {
                    renderModelDetail();
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function addLoraToNode(filename) {
        if (!node._loraData.some(l => l.name === filename)) {
            node._loraData.push({
                name: filename,
                strength_model: 1.0,
                strength_clip: 1.0,
                enabled: true
            });
            updateJsonValue(node);
            syncLoraWidgets(node, node._loraData);
        }
    }

    // --- Save Favorites to Server ---
    async function saveFavorites() {
        try {
            const favResp = await fetch("/anima-tools/favorites");
            let fullFavs = {};
            if (favResp.ok) fullFavs = await favResp.json();
            
            fullFavs.lora = favoritesConfig.lora;
            
            await fetch("/anima-tools/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fullFavs)
            });
        } catch (e) {
            console.error("Failed to save favorites to server", e);
        }
    }

    // --- Toggle Favorite Star ---
    async function toggleFavorite(model, favBtnElement) {
        const items = favoritesConfig.lora.items;
        const index = items.findIndex(item => String(item.id) === String(model.id));
        
        if (index !== -1) {
            items.splice(index, 1);
            favBtnElement.classList.remove("active");
            favBtnElement.innerHTML = "☆";
        } else {
            items.push({
                id: model.id,
                name: model.name,
                creator: model.creator,
                modelVersions: model.modelVersions,
                description: model.description
            });
            favBtnElement.classList.add("active");
            favBtnElement.innerHTML = "★";
        }
        
        await saveFavorites();
        
        if (currentCategory === "favorites") {
            renderFavoritesOnly();
        }
    }

    // --- Settings Modal ---
    function openSettingsModal() {
        const dialog = document.createElement("div");
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            z-index: 100001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const content = document.createElement("div");
        content.style.cssText = `
            background: #1c1c1e;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 480px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            gap: 16px;
            animation: animaFadeIn 0.2s ease-out;
            color: #fff;
        `;
        
        const title = document.createElement("div");
        title.innerText = t("Save Path Config");
        title.style.cssText = "font-size: 16px; font-weight: 700; color: #ffffff;";

        const pathLabel = document.createElement("div");
        pathLabel.innerText = t("Save Path");
        pathLabel.style.cssText = "font-size: 12px; color: #9ca3af; margin-bottom: -8px;";
        
        const pathInput = document.createElement("input");
        pathInput.type = "text";
        pathInput.value = config.custom_lora_dir || "";
        pathInput.placeholder = t("Enter absolute directory path...");
        pathInput.style.cssText = `
            background: #2c2c2e;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            padding: 10px 12px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
        `;

        const keyLabel = document.createElement("div");
        keyLabel.innerText = t("Civitai API Key Config");
        keyLabel.style.cssText = "font-size: 12px; color: #9ca3af; margin-bottom: -8px;";

        const keyInput = document.createElement("input");
        keyInput.type = "password";
        keyInput.value = config.civitai_api_key || "";
        keyInput.placeholder = t("Enter Civitai API Key...");
        keyInput.style.cssText = `
            background: #2c2c2e;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 8px;
            padding: 10px 12px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
        `;
        
        const btnRow = document.createElement("div");
        btnRow.style.cssText = "display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;";
        
        const cancel = document.createElement("button");
        cancel.innerText = t("Cancel");
        cancel.className = "anima-btn-secondary";
        cancel.onclick = () => dialog.remove();
        
        const confirm = document.createElement("button");
        confirm.innerText = t("Save");
        confirm.className = "anima-btn-primary";
        confirm.onclick = async () => {
            const dirVal = pathInput.value.trim();
            const keyVal = keyInput.value.trim();
            
            try {
                const resp = await fetch("/anima-tools/lora/config", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        custom_lora_dir: dirVal,
                        civitai_api_key: keyVal
                    })
                });
                
                if (resp.ok) {
                    const data = await resp.json();
                    config.custom_lora_dir = dirVal;
                    config.civitai_api_key = keyVal;
                    globalLoraConfig = config;
                    alert(t("Path saved successfully"));
                    
                    const localResp = await fetch("/anima-tools/lora/local");
                    if (localResp.ok) {
                        localLoras = await localResp.json();
                        globalLocalLoras = localLoras;
                    }
                    if (currentCategory === "downloaded") {
                        renderDownloadedOnly();
                    } else if (currentCategory === "favorites") {
                        renderFavoritesOnly();
                    } else {
                        renderGrid();
                    }
                    dialog.remove();
                } else {
                    alert("Failed to save config.");
                }
            } catch (e) {
                console.error(e);
                alert("Error saving settings.");
            }
        };
        
        btnRow.appendChild(cancel);
        btnRow.appendChild(confirm);
        content.appendChild(title);
        content.appendChild(pathLabel);
        content.appendChild(pathInput);
        content.appendChild(keyLabel);
        content.appendChild(keyInput);
        content.appendChild(btnRow);
        dialog.appendChild(content);
        
        document.body.appendChild(dialog);
    }
}
