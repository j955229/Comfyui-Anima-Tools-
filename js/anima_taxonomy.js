const TAXONOMIES = {
    clothing: [
        {
            id: "tops_outerwear",
            label: "Tops & Outerwear",
            keywords: ["shirt", "blouse", "sweater", "hoodie", "jacket", "coat", "cardigan", "vest", "top", "sleeves"],
        },
        {
            id: "bottoms_legwear",
            label: "Bottoms & Legwear",
            keywords: ["skirt", "pants", "shorts", "thighhighs", "stockings", "pantyhose", "leggings", "socks", "bare legs"],
        },
        {
            id: "dress_gown",
            label: "Dress & Gown",
            keywords: ["dress", "gown", "kimono", "yukata", "maid", "wedding dress", "chinese clothes", "robe"],
        },
        {
            id: "uniform_suit",
            label: "Uniform & Suit",
            keywords: ["uniform", "school uniform", "serafuku", "suit", "military", "police", "nurse", "office lady"],
        },
        {
            id: "swim_lingerie",
            label: "Swim & Lingerie",
            keywords: ["swimsuit", "bikini", "lingerie", "underwear", "bra", "panties", "leotard", "bodysuit"],
        },
        {
            id: "revealing",
            label: "Revealing",
            keywords: ["revealing", "cleavage", "navel", "bare shoulders", "side slit", "open clothes", "see-through", "underboob"],
        },
        {
            id: "fantasy_cosplay",
            label: "Fantasy & Cosplay",
            keywords: ["cosplay", "armor", "fantasy", "magical girl", "witch", "nun", "cape", "demon", "angel"],
        },
        {
            id: "accessories",
            label: "Accessories",
            keywords: ["hat", "gloves", "ribbon", "necktie", "bow", "jewelry", "glasses", "mask", "belt", "shoes", "footwear", "collar"],
        },
    ],
    background: [
        {
            id: "indoor_rooms",
            label: "Indoor Rooms",
            keywords: ["indoor", "room", "bedroom", "kitchen", "bathroom", "classroom", "office", "library", "hallway", "interior"],
        },
        {
            id: "city_daily",
            label: "City & Daily",
            keywords: ["city", "street", "urban", "alley", "shop", "cafe", "restaurant", "convenience store", "road", "building", "apartment"],
        },
        {
            id: "nature_water",
            label: "Nature & Water",
            keywords: ["forest", "beach", "sea", "ocean", "lake", "river", "mountain", "garden", "park", "outdoors", "plant", "grass", "sky", "snow", "desert"],
        },
        {
            id: "school_work",
            label: "School & Work",
            keywords: ["school", "classroom", "office", "workplace", "laboratory", "studio", "desk", "library"],
        },
        {
            id: "transit_vehicle",
            label: "Transit & Vehicle",
            keywords: ["train", "bus", "car", "subway", "airport", "station", "vehicle", "cockpit", "railway"],
        },
        {
            id: "fantasy_scifi",
            label: "Fantasy & Sci-Fi",
            keywords: ["fantasy", "sci-fi", "cyberpunk", "castle", "magic", "futuristic", "spaceship", "ruins", "temple", "dungeon"],
        },
        {
            id: "abstract_minimal",
            label: "Abstract & Minimal",
            keywords: ["abstract", "minimalist", "simple background", "gradient", "pattern", "geometric", "blank", "monochrome"],
        },
        {
            id: "weather_time",
            label: "Weather & Time",
            keywords: ["night", "sunset", "morning", "rain", "snow", "fog", "cloudy", "sunny", "storm", "day", "evening"],
        },
    ],
    pose: [
        {
            id: "hands_arms",
            label: "Hands & Arms",
            keywords: ["hand", "hands", "arm", "arms", "finger", "thumb", "salute", "shushing", "armpit", "v", "waving", "peace sign"],
        },
        {
            id: "standing_action",
            label: "Standing & Action",
            keywords: ["standing", "stand", "walking", "running", "jumping", "dynamic", "kick", "dance", "reaching"],
        },
        {
            id: "sitting_kneeling",
            label: "Sitting & Kneeling",
            keywords: ["sitting", "sit", "chair", "seiza", "kneeling", "knee", "squat", "crouch"],
        },
        {
            id: "lying_floor",
            label: "Lying & Floor",
            keywords: ["lying", "prone", "on back", "on stomach", "all fours", "floor", "bed"],
        },
        {
            id: "duo_interaction",
            label: "Duo & Interaction",
            keywords: ["duo", "interaction", "hug", "kiss", "holding hands", "hands on another", "breast grab", "lap pillow"],
        },
        {
            id: "props_holding",
            label: "Props & Holding",
            keywords: ["hold", "holding", "object", "phone", "weapon", "umbrella", "cup", "microphone", "presenting"],
        },
        {
            id: "adjusting_dressing",
            label: "Adjusting & Dressing",
            keywords: ["undressing", "dress", "dressing", "lift", "pull", "skirt", "shirt", "clothes", "kimono", "adjusting"],
        },
        {
            id: "body_legs",
            label: "Body & Legs",
            keywords: ["leg", "legs", "leaning", "reclining", "straddling", "stretching", "yoga", "torso", "ankles", "split", "head", "chin", "bowing"],
        },
        {
            id: "daily_misc",
            label: "Daily & Misc",
            keywords: ["daily & miscellaneous", "caramel", "yawning", "rubbing eyes", "hat tip", "shrugging", "air guitar", "flower"],
        },
    ],
};

function normalizeText(value) {
    return String(value || "").toLowerCase().replace(/[_-]+/g, " ");
}

function itemText(item) {
    return normalizeText([
        item?.name,
        item?.name_zh,
        item?.tags,
        item?.tags_zh,
        ...(Array.isArray(item?.traits) ? item.traits : []),
        ...(Array.isArray(item?.categories) ? item.categories : []),
    ].filter(Boolean).join(" "));
}

function itemMatchesCategory(item, category) {
    const text = itemText(item);
    return category.keywords.some(keyword => text.includes(normalizeText(keyword)));
}

export function getTaxonomyCategories(section) {
    return TAXONOMIES[section] || [];
}

export function itemMatchesTaxonomy(section, item, categoryId) {
    if (!categoryId || categoryId === "all") return true;
    const category = getTaxonomyCategories(section).find(item => item.id === categoryId);
    if (!category) return true;
    return itemMatchesCategory(item, category);
}

export function getTaxonomyCounts(section, rows) {
    const counts = new Map();
    getTaxonomyCategories(section).forEach(category => {
        counts.set(category.id, 0);
    });
    rows.forEach(item => {
        getTaxonomyCategories(section).forEach(category => {
            if (itemMatchesCategory(item, category)) {
                counts.set(category.id, (counts.get(category.id) || 0) + 1);
            }
        });
    });
    return counts;
}
