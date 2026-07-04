const ANIMADEX_BOOTSTRAP_URL = "/anima-tools/character/animadex/all?pages=8";
const ANIMADEX_SEARCH_URL = "/anima-tools/character/animadex/search?pages=8";

export const CHARACTER_SOURCES = [
    { id: "animadex", label: "Animadex" },
];

let characterSourceStatus = {
    animadex: "未载入",
};
let requestCache = new Map();

function normalizeAnimadexCharacter(item) {
    const trigger = String(item?.trigger || "").trim();
    const name = String(item?.name || item?.slug || trigger.split(",")[0] || "").trim();
    return {
        ...item,
        section: "character",
        source: "animadex",
        sourceLabel: "Animadex",
        hubKey: `animadex:${item?.slug || trigger || name}`,
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

async function loadAnimadexCharacters(query = "") {
    const normalizedQuery = String(query || "").trim();
    const cacheKey = normalizedQuery || "__popular__";
    if (!requestCache.has(cacheKey)) {
        const url = normalizedQuery
            ? `${ANIMADEX_SEARCH_URL}&q=${encodeURIComponent(normalizedQuery)}`
            : ANIMADEX_BOOTSTRAP_URL;
        characterSourceStatus.animadex = normalizedQuery ? "正在搜索 Animadex" : "正在载入 Animadex";
        requestCache.set(cacheKey, fetch(url)
            .then(async response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const payload = await response.json();
                if (!payload?.success || !Array.isArray(payload?.results)) {
                    throw new Error(payload?.error || "bad payload");
                }
                const rows = payload.results.map(normalizeAnimadexCharacter);
                const total = Number(payload.total || rows.length).toLocaleString();
                characterSourceStatus.animadex = `${rows.length.toLocaleString()} / ${total} 人物`;
                return rows;
            })
            .catch(error => {
                console.warn("[Anima Tools] Failed to load Animadex characters", error);
                setAnimadexFailureStatus(error);
                requestCache.delete(cacheKey);
                return [];
            }));
    }
    return requestCache.get(cacheKey);
}

export function getActiveCharacterSource() {
    return "animadex";
}

export function setActiveCharacterSource() {
}

export function getCharacterSourceStatus() {
    return characterSourceStatus.animadex || "";
}

export async function getCharacterDataForSource(source = "animadex", query = "") {
    return loadAnimadexCharacters(query);
}
