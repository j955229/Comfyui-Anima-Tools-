const TAXONOMY_GROUPS = {
    character: [
        {
            id: "gender",
            label: "性别",
            children: [
                { id: "gender_girl", label: "女性", keywords: ["1girl"] },
                { id: "gender_boy", label: "男性", keywords: ["1boy"] },
                { id: "gender_other", label: "其他", keywords: ["1other", "ambiguous", "no humans"] },
            ],
        },
        {
            id: "hair",
            label: "发色",
            children: [
                { id: "hair_black", label: "黑发", keywords: ["black hair", "hair black"] },
                { id: "hair_blonde", label: "金发", keywords: ["blonde hair", "hair blonde"] },
                { id: "hair_brown", label: "棕发", keywords: ["brown hair", "hair brown"] },
                { id: "hair_white", label: "白发", keywords: ["white hair", "silver hair", "hair white"] },
                { id: "hair_blue", label: "蓝发", keywords: ["blue hair", "aqua hair", "hair blue"] },
                { id: "hair_pink", label: "粉发", keywords: ["pink hair", "hair pink"] },
                { id: "hair_red", label: "红发", keywords: ["red hair", "hair red"] },
                { id: "hair_green", label: "绿发", keywords: ["green hair", "hair green"] },
                { id: "hair_purple", label: "紫发", keywords: ["purple hair", "hair purple"] },
            ],
        },
        {
            id: "eyes",
            label: "瞳色",
            children: [
                { id: "eye_blue", label: "蓝眼", keywords: ["blue eyes", "eye blue"] },
                { id: "eye_red", label: "红眼", keywords: ["red eyes", "eye red"] },
                { id: "eye_brown", label: "棕眼", keywords: ["brown eyes", "eye brown"] },
                { id: "eye_green", label: "绿眼", keywords: ["green eyes", "eye green"] },
                { id: "eye_purple", label: "紫眼", keywords: ["purple eyes", "eye purple"] },
                { id: "eye_yellow", label: "黄眼", keywords: ["yellow eyes", "eye yellow"] },
                { id: "eye_pink", label: "粉眼", keywords: ["pink eyes", "eye pink"] },
            ],
        },
        {
            id: "copyright",
            label: "热门作品",
            children: [
                { id: "series_pokemon", label: "Pokemon", keywords: ["pokemon"] },
                { id: "series_kancolle", label: "舰队收藏", keywords: ["kantai collection", "kancolle"] },
                { id: "series_fate", label: "Fate", keywords: ["fate (series)", "fate/grand order"] },
                { id: "series_hololive", label: "Hololive", keywords: ["hololive"] },
                { id: "series_idolmaster", label: "偶像大师", keywords: ["idolmaster"] },
                { id: "series_touhou", label: "东方", keywords: ["touhou"] },
                { id: "series_blue_archive", label: "蔚蓝档案", keywords: ["blue archive"] },
                { id: "series_arknights", label: "明日方舟", keywords: ["arknights"] },
                { id: "series_azur_lane", label: "碧蓝航线", keywords: ["azur lane"] },
                { id: "series_genshin", label: "原神", keywords: ["genshin impact"] },
            ],
        },
    ],
    clothing: [
        {
            id: "garment",
            label: "服装类型",
            children: [
                {
                    id: "tops_outerwear",
                    label: "上衣与外套",
                    keywords: ["shirt", "blouse", "sweater", "hoodie", "jacket", "coat", "cardigan", "vest", "top", "sleeves"],
                },
                {
                    id: "bottoms_legwear",
                    label: "下装与腿部",
                    keywords: ["skirt", "pants", "shorts", "thighhighs", "stockings", "pantyhose", "leggings", "socks", "bare legs"],
                },
                {
                    id: "dress_gown",
                    label: "连衣裙与礼服",
                    keywords: ["dress", "gown", "kimono", "yukata", "maid", "wedding dress", "chinese clothes", "robe"],
                },
                {
                    id: "uniform_suit",
                    label: "制服与套装",
                    keywords: ["uniform", "school uniform", "serafuku", "suit", "military", "police", "nurse", "office lady"],
                },
            ],
        },
        {
            id: "skin_detail",
            label: "露肤与细节",
            children: [
                {
                    id: "swim_lingerie",
                    label: "泳装与内衣",
                    keywords: ["swimsuit", "bikini", "lingerie", "underwear", "bra", "panties", "leotard", "bodysuit"],
                },
                {
                    id: "revealing",
                    label: "暴露服装",
                    keywords: ["revealing", "cleavage", "navel", "bare shoulders", "side slit", "open clothes", "see-through", "underboob"],
                },
                {
                    id: "accessories",
                    label: "配件",
                    keywords: ["hat", "gloves", "ribbon", "necktie", "bow", "jewelry", "glasses", "mask", "belt", "shoes", "footwear", "collar"],
                },
                {
                    id: "fantasy_cosplay",
                    label: "奇幻与角色扮演",
                    keywords: ["cosplay", "armor", "fantasy", "magical girl", "witch", "nun", "cape", "demon", "angel"],
                },
            ],
        },
    ],
    background: [
        {
            id: "place",
            label: "地点",
            children: [
                {
                    id: "indoor_rooms",
                    label: "室内房间",
                    keywords: ["indoor", "room", "bedroom", "kitchen", "bathroom", "classroom", "office", "library", "hallway", "interior"],
                },
                {
                    id: "city_daily",
                    label: "城市日常",
                    keywords: ["city", "street", "urban", "alley", "shop", "cafe", "restaurant", "convenience store", "road", "building", "apartment"],
                },
                {
                    id: "nature_water",
                    label: "自然与水景",
                    keywords: ["forest", "beach", "sea", "ocean", "lake", "river", "mountain", "garden", "park", "outdoors", "plant", "grass", "sky", "snow", "desert"],
                },
                {
                    id: "school_work",
                    label: "学校与工作",
                    keywords: ["school", "classroom", "office", "workplace", "laboratory", "studio", "desk", "library"],
                },
                {
                    id: "transit_vehicle",
                    label: "交通与载具",
                    keywords: ["train", "bus", "car", "subway", "airport", "station", "vehicle", "cockpit", "railway"],
                },
            ],
        },
        {
            id: "genre_mood",
            label: "风格与氛围",
            children: [
                {
                    id: "fantasy_scifi",
                    label: "奇幻与科幻",
                    keywords: ["fantasy", "sci-fi", "cyberpunk", "castle", "magic", "futuristic", "spaceship", "ruins", "temple", "dungeon"],
                },
                {
                    id: "abstract_minimal",
                    label: "抽象与简约",
                    keywords: ["abstract", "minimalist", "simple background", "gradient", "pattern", "geometric", "blank", "monochrome"],
                },
                {
                    id: "weather_time",
                    label: "天气与时间",
                    keywords: ["night", "sunset", "morning", "rain", "snow", "fog", "cloudy", "sunny", "storm", "day", "evening"],
                },
            ],
        },
    ],
    pose: [
        {
            id: "body_position",
            label: "身体姿态",
            children: [
                {
                    id: "standing_action",
                    label: "站立与动作",
                    keywords: ["standing", "stand", "walking", "running", "jumping", "dynamic", "kick", "dance", "reaching"],
                },
                {
                    id: "sitting_kneeling",
                    label: "坐姿与跪姿",
                    keywords: ["sitting", "sit", "chair", "seiza", "kneeling", "knee", "squat", "crouch"],
                },
                {
                    id: "lying_floor",
                    label: "躺姿与地面",
                    keywords: ["lying", "prone", "on back", "on stomach", "all fours", "floor", "bed"],
                },
                {
                    id: "body_legs",
                    label: "身体与腿部",
                    keywords: ["leg", "legs", "leaning", "reclining", "straddling", "stretching", "yoga", "torso", "ankles", "split", "head", "chin", "bowing"],
                },
            ],
        },
        {
            id: "gesture_action",
            label: "手势与动作",
            children: [
                {
                    id: "hands_arms",
                    label: "手部与手臂",
                    keywords: ["hand", "hands", "arm", "arms", "finger", "thumb", "salute", "shushing", "armpit", "v", "waving", "peace sign"],
                },
                {
                    id: "props_holding",
                    label: "道具与持物",
                    keywords: ["hold", "holding", "object", "phone", "weapon", "umbrella", "cup", "microphone", "presenting"],
                },
                {
                    id: "adjusting_dressing",
                    label: "整理与穿脱",
                    keywords: ["undressing", "dress", "dressing", "lift", "pull", "skirt", "shirt", "clothes", "kimono", "adjusting"],
                },
                {
                    id: "daily_misc",
                    label: "日常与杂项",
                    keywords: ["daily & miscellaneous", "caramel", "yawning", "rubbing eyes", "hat tip", "shrugging", "air guitar", "flower"],
                },
            ],
        },
        {
            id: "interaction",
            label: "互动",
            children: [
                {
                    id: "duo_interaction",
                    label: "双人与互动",
                    keywords: ["duo", "interaction", "hug", "kiss", "holding hands", "hands on another", "breast grab", "lap pillow"],
                },
            ],
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
        item?.copyright,
        item?.copyright_name,
        item?.gender,
        item?.hair ? `${item.hair} hair hair ${item.hair}` : "",
        item?.eye ? `${item.eye} eyes eye ${item.eye}` : "",
        item?.trigger,
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

export function getTaxonomyGroups(section) {
    return TAXONOMY_GROUPS[section] || [];
}

export function getTaxonomyCategories(section) {
    return getTaxonomyGroups(section).flatMap(group => group.children || []);
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
