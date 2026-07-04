import "./character_data.js";

const CHARACTER_SOURCE_STORAGE_KEY = "anima-hub-character-source";
const ANIMADEX_ALL_CHARACTERS_URL = "/anima-tools/character/animadex/all";

export const CHARACTER_SOURCES = [
    { id: "local", label: "本地" },
    { id: "animadex", label: "Animadex" },
    { id: "merged", label: "合并" },
];

let activeCharacterSource = localStorage.getItem(CHARACTER_SOURCE_STORAGE_KEY) || "local";
let animadexCharactersPromise = null;
let characterSourceStatus = {
    local: "",
    animadex: "未载入",
    merged: "",
};

function normalizeText(value) {
    return String(value || "").trim().toLowerCase().replace(/[_\s]+/g, " ");
}

function characterKey(item) {
    return `${normalizeText(item?.name || item?.slug)}||${normalizeText(item?.copyright)}`;
}

function normalizeLocalCharacter(item) {
    return {
        ...item,
        section: "character",
        source: "local",
        sourceLabel: "本地",
        hubKey: `local:${characterKey(item)}`,
        name: String(item?.name || "").trim(),
        copyright: String(item?.copyright || "").trim(),
        post_count: item?.post_count ?? item?.count ?? 0,
        postCount: item?.post_count ?? item?.count ?? 0,
        tags: Array.isArray(item?.tags) ? item.tags.join(", ") : item?.tags || "",
    };
}

function normalizeAnimadexCharacter(item) {
    const trigger = String(item?.trigger || "").trim();
    const name = String(item?.name || item?.slug || trigger.split(",")[0] || "").trim();
    return {
        ...item,
        section: "character",
        source: "animadex",
        sourceLabel: "Animadex",
        hubKey: `animadex:${item?.slug || characterKey(item)}`,
        name,
        copyright: String(item?.copyright || "").trim(),
        copyright_name: item?.copyright_name || "",
        trigger,
        post_count: item?.count ?? item?.post_count ?? 0,
        postCount: item?.count ?? item?.post_count ?? 0,
        imageUrl: item?.thumb_url || item?.img_url || "",
        preview: item?.thumb_url || "",
        tags: Array.isArray(item?.tags) ? item.tags.join(", ") : item?.tags || "",
    };
}

function setAnimadexFailureStatus(error) {
    const message = error?.message || String(error || "unknown error");
    characterSourceStatus.animadex = `载入失败：${message}`;
}

function loadLocalCharacters() {
    const rows = Array.isArray(window.characterData) ? window.characterData : [];
    characterSourceStatus.local = `${rows.length.toLocaleString()} 人物`;
    return rows.map(normalizeLocalCharacter);
}

async function loadAnimadexCharacters() {
    if (!animadexCharactersPromise) {
        characterSourceStatus.animadex = "正在通过 ComfyUI 载入 Animadex";
        animadexCharactersPromise = fetch(ANIMADEX_ALL_CHARACTERS_URL)
            .then(async response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const payload = await response.json();
                if (!payload?.success || !Array.isArray(payload?.results)) {
                    throw new Error(payload?.error || "bad payload");
                }
                const rows = payload.results.map(normalizeAnimadexCharacter);
                characterSourceStatus.animadex = `${rows.length.toLocaleString()} 人物`;
                return rows;
            })
            .catch(error => {
                console.warn("[Anima Tools] Failed to load Animadex characters", error);
                setAnimadexFailureStatus(error);
                animadexCharactersPromise = null;
                return [];
            });
    }
    return animadexCharactersPromise;
}

function mergeCharacters(localCharacters, animadexCharacters) {
    const merged = new Map();
    localCharacters.forEach(item => {
        const key = characterKey(item);
        merged.set(key, {
            ...item,
            source: "merged",
            sourceLabel: "本地",
            hubKey: `merged:${key}`,
        });
    });

    animadexCharacters.forEach(item => {
        const key = characterKey(item);
        const existing = merged.get(key);
        if (!existing) {
            merged.set(key, {
                ...item,
                source: "merged",
                sourceLabel: "Animadex",
                hubKey: `merged:${key}`,
            });
            return;
        }
        merged.set(key, {
            ...existing,
            ...item,
            source: "merged",
            sourceLabel: "合并",
            hubKey: `merged:${key}`,
            local: existing,
            animadex: item,
            post_count: Math.max(existing.post_count || 0, item.post_count || 0),
            postCount: Math.max(existing.postCount || 0, item.postCount || 0),
            tags: item.tags || existing.tags || "",
            imageUrl: item.imageUrl || existing.imageUrl || "",
            preview: item.preview || existing.preview || "",
        });
    });

    const rows = Array.from(merged.values()).sort((a, b) => (b.post_count || 0) - (a.post_count || 0));
    characterSourceStatus.merged = characterSourceStatus.animadex.startsWith("载入失败")
        ? `${rows.length.toLocaleString()} 人物（仅本地，Animadex 失败）`
        : `${rows.length.toLocaleString()} 人物`;
    return rows;
}

export function getActiveCharacterSource() {
    return CHARACTER_SOURCES.some(source => source.id === activeCharacterSource) ? activeCharacterSource : "local";
}

export function setActiveCharacterSource(source) {
    activeCharacterSource = CHARACTER_SOURCES.some(item => item.id === source) ? source : "local";
    localStorage.setItem(CHARACTER_SOURCE_STORAGE_KEY, activeCharacterSource);
}

export function getCharacterSourceStatus(source = getActiveCharacterSource()) {
    return characterSourceStatus[source] || "";
}

export async function getCharacterDataForSource(source = getActiveCharacterSource()) {
    const localCharacters = loadLocalCharacters();
    if (source === "local") return localCharacters;

    const animadexCharacters = await loadAnimadexCharacters();
    if (source === "animadex") return animadexCharacters;
    return mergeCharacters(localCharacters, animadexCharacters);
}
