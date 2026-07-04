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
    composition: [
        {
            id: "camera_angle",
            label: "镜头角度",
            children: [
                { id: "angle_high", label: "俯视", keywords: ["high angle", "from above", "looking down", "bird's-eye"] },
                { id: "angle_low", label: "仰视", keywords: ["low angle", "from below", "looking up", "worm's-eye"] },
                { id: "angle_tilted", label: "倾斜", keywords: ["dutch angle", "tilted angle", "diagonal"] },
                { id: "angle_pov", label: "主观视角", keywords: ["pov", "point of view", "first-person", "over shoulder"] },
                { id: "angle_side", label: "侧面", keywords: ["profile", "side view", "looking to the side"] },
            ],
        },
        {
            id: "shot_size",
            label: "景别",
            children: [
                { id: "shot_close", label: "特写", keywords: ["close-up", "extreme close-up", "face focus"] },
                { id: "shot_half", label: "半身", keywords: ["upper body", "medium close-up", "cowboy shot", "knees up"] },
                { id: "shot_full", label: "全身", keywords: ["full body", "full-length"] },
                { id: "shot_wide", label: "远景", keywords: ["wide shot", "long shot", "scenery focus"] },
            ],
        },
        {
            id: "framing_depth",
            label: "构成与透视",
            children: [
                { id: "frame_center", label: "居中与对称", keywords: ["centered", "symmetrical", "symmetry"] },
                { id: "frame_offcenter", label: "偏中心", keywords: ["rule of thirds", "off-center", "balanced"] },
                { id: "frame_negative", label: "留白", keywords: ["negative space", "minimalism", "simple background"] },
                { id: "depth_blur", label: "景深", keywords: ["depth of field", "blurry foreground", "foreground blur"] },
                { id: "depth_distort", label: "透视变形", keywords: ["forced perspective", "fisheye", "wide-angle", "foreshortening"] },
            ],
        },
    ],
    expression: [
        {
            id: "basic_emotion",
            label: "基础情绪",
            children: [
                { id: "emotion_happy", label: "开心", keywords: ["smile", "grin", "laughing", "happy"] },
                { id: "emotion_angry", label: "生气", keywords: ["angry", "annoyed", "furrowed brow"] },
                { id: "emotion_sad", label: "悲伤", keywords: ["sad", "crying", "tears"] },
                { id: "emotion_surprise", label: "惊讶害怕", keywords: ["surprised", "scared", "fear", "wide eyes"] },
                { id: "emotion_shy", label: "害羞尴尬", keywords: ["embarrassed", "blush", "averting eyes"] },
            ],
        },
        {
            id: "mouth",
            label: "嘴型",
            children: [
                { id: "mouth_open", label: "张嘴", keywords: ["open mouth", "parted lips"] },
                { id: "mouth_closed", label: "闭嘴", keywords: ["closed mouth", "mouth closed"] },
                { id: "mouth_pout", label: "嘟嘴", keywords: ["pout", "pouting", "puffed cheeks"] },
                { id: "mouth_tongue", label: "吐舌", keywords: ["tongue out", "tongue"] },
                { id: "mouth_teeth", label: "牙齿", keywords: ["clenched teeth", "teeth", "grimace"] },
            ],
        },
        {
            id: "eyes_face",
            label: "眼神与脸部",
            children: [
                { id: "eyes_closed", label: "闭眼", keywords: ["closed eyes", "eyes closed"] },
                { id: "eyes_sleepy", label: "困倦", keywords: ["half-closed eyes", "sleepy", "relaxed"] },
                { id: "eyes_sparkle", label: "闪亮眼", keywords: ["sparkling eyes", "starry eyes", "excited"] },
                { id: "eyes_love", label: "爱心眼", keywords: ["heart-shaped pupils", "heart eyes", "love"] },
                { id: "face_blank", label: "无表情", keywords: ["expressionless", "blank stare", "emotionless"] },
                { id: "face_smug", label: "得意", keywords: ["smug", "confident"] },
            ],
        },
    ],
    lighting: [
        {
            id: "light_direction",
            label: "光源方向",
            children: [
                { id: "light_back", label: "逆光", keywords: ["backlighting", "backlight", "silhouette"] },
                { id: "light_rim", label: "轮廓光", keywords: ["rim lighting", "rim light", "edge light"] },
                { id: "light_side", label: "侧光", keywords: ["side lighting", "sidelighting", "side light"] },
                { id: "light_under", label: "底光", keywords: ["underlighting", "underlight", "lit from below"] },
                { id: "light_top", label: "顶光", keywords: ["overhead lighting", "top light", "hard shadows"] },
            ],
        },
        {
            id: "light_quality",
            label: "光线质感",
            children: [
                { id: "quality_soft", label: "柔光", keywords: ["soft lighting", "soft light", "gentle shadows"] },
                { id: "quality_hard", label: "硬光", keywords: ["hard lighting", "hard light", "sharp shadows"] },
                { id: "quality_dramatic", label: "戏剧光", keywords: ["dramatic lighting", "high contrast", "deep shadows"] },
                { id: "quality_cinematic", label: "电影感", keywords: ["cinematic lighting", "film lighting", "dramatic shadows"] },
                { id: "quality_chiaroscuro", label: "明暗对照", keywords: ["chiaroscuro", "tenebrism"] },
            ],
        },
        {
            id: "light_effect",
            label: "光效",
            children: [
                { id: "effect_volumetric", label: "体积光", keywords: ["volumetric lighting", "light rays", "atmosphere"] },
                { id: "effect_godrays", label: "光束", keywords: ["god rays", "crepuscular rays", "light rays"] },
                { id: "effect_flare", label: "镜头光晕", keywords: ["lens flare", "light leak"] },
                { id: "effect_bloom", label: "泛光", keywords: ["bloom", "glow", "glowing"] },
                { id: "effect_bokeh", label: "散景", keywords: ["bokeh", "blurry background"] },
            ],
        },
        {
            id: "time_color",
            label: "时间与色彩",
            children: [
                { id: "time_golden", label: "黄金时刻", keywords: ["golden hour", "sunset", "warm lighting"] },
                { id: "time_blue", label: "蓝调时刻", keywords: ["blue hour", "dusk", "cool lighting"] },
                { id: "time_moon", label: "月光", keywords: ["moonlight", "night"] },
                { id: "color_neon", label: "霓虹", keywords: ["neon lighting", "neon lights", "cyberpunk"] },
                { id: "color_warmcool", label: "冷暖光", keywords: ["warm lighting", "cool lighting", "colored lighting"] },
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
