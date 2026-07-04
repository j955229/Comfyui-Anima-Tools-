const expressionData = [
  {
    "id": "expression_emotion_0001",
    "name": "Smile",
    "name_zh": "微笑",
    "tags": "smile, gentle smile,",
    "tags_zh": "微笑, 温柔微笑",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["smile", "gentle", "happy"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0002",
    "name": "Grin",
    "name_zh": "咧嘴笑",
    "tags": "grin, open smile,",
    "tags_zh": "咧嘴笑, 开朗笑容",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["grin", "open smile", "happy"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0003",
    "name": "Laughing",
    "name_zh": "大笑",
    "tags": "laughing, open mouth, smile,",
    "tags_zh": "大笑, 张嘴, 笑容",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["laughing", "open mouth", "joy"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0004",
    "name": "Angry",
    "name_zh": "生气",
    "tags": "angry, anger vein, furrowed brow,",
    "tags_zh": "生气, 青筋, 皱眉",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["angry", "furrowed brow", "intense"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0005",
    "name": "Annoyed",
    "name_zh": "不耐烦",
    "tags": "annoyed, half-closed eyes, frown,",
    "tags_zh": "不耐烦, 半闭眼, 皱眉",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["annoyed", "half-closed eyes", "frown"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0006",
    "name": "Sad",
    "name_zh": "悲伤",
    "tags": "sad, downcast eyes, frown,",
    "tags_zh": "悲伤, 垂眼, 皱眉",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["sad", "downcast", "frown"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0007",
    "name": "Crying",
    "name_zh": "哭泣",
    "tags": "crying, tears, teardrop,",
    "tags_zh": "哭泣, 眼泪, 泪滴",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["crying", "tears", "sad"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0008",
    "name": "Surprised",
    "name_zh": "惊讶",
    "tags": "surprised, wide eyes, open mouth,",
    "tags_zh": "惊讶, 睁大眼, 张嘴",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["surprised", "wide eyes", "open mouth"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0009",
    "name": "Scared",
    "name_zh": "害怕",
    "tags": "scared, fear, trembling,",
    "tags_zh": "害怕, 恐惧, 发抖",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["scared", "fear", "trembling"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_emotion_0010",
    "name": "Embarrassed",
    "name_zh": "害羞尴尬",
    "tags": "embarrassed, blush, averting eyes,",
    "tags_zh": "尴尬, 脸红, 移开视线",
    "categories": ["基础情绪 (Basic Emotion)"],
    "traits": ["embarrassed", "blush", "averting eyes"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_mouth_0001",
    "name": "Open Mouth",
    "name_zh": "张嘴",
    "tags": "open mouth, parted lips,",
    "tags_zh": "张嘴, 嘴唇微张",
    "categories": ["嘴型 (Mouth)"],
    "traits": ["open mouth", "parted lips", "mouth"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_mouth_0002",
    "name": "Closed Mouth",
    "name_zh": "闭嘴",
    "tags": "closed mouth, mouth closed,",
    "tags_zh": "闭嘴, 嘴巴闭合",
    "categories": ["嘴型 (Mouth)"],
    "traits": ["closed mouth", "mouth"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_mouth_0003",
    "name": "Pout",
    "name_zh": "嘟嘴",
    "tags": "pout, pouting, puffed cheeks,",
    "tags_zh": "嘟嘴, 撅嘴, 鼓脸",
    "categories": ["嘴型 (Mouth)"],
    "traits": ["pout", "puffed cheeks", "cute"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_mouth_0004",
    "name": "Tongue Out",
    "name_zh": "吐舌",
    "tags": "tongue out, tongue, playful,",
    "tags_zh": "吐舌, 舌头, 调皮",
    "categories": ["嘴型 (Mouth)"],
    "traits": ["tongue out", "playful", "mouth"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_mouth_0005",
    "name": "Clenched Teeth",
    "name_zh": "咬紧牙关",
    "tags": "clenched teeth, teeth, grimace,",
    "tags_zh": "咬紧牙关, 牙齿, 痛苦表情",
    "categories": ["嘴型 (Mouth)"],
    "traits": ["clenched teeth", "teeth", "grimace"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_mouth_0006",
    "name": "Wavy Mouth",
    "name_zh": "波浪嘴",
    "tags": "wavy mouth, uneasy, embarrassed,",
    "tags_zh": "波浪嘴, 不安, 尴尬",
    "categories": ["嘴型 (Mouth)"],
    "traits": ["wavy mouth", "uneasy", "embarrassed"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_eyes_0001",
    "name": "Closed Eyes",
    "name_zh": "闭眼",
    "tags": "closed eyes, eyes closed,",
    "tags_zh": "闭眼, 眼睛闭合",
    "categories": ["眼神 (Eyes)"],
    "traits": ["closed eyes", "calm", "eyes"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_eyes_0002",
    "name": "Half-Closed Eyes",
    "name_zh": "半闭眼",
    "tags": "half-closed eyes, sleepy, relaxed,",
    "tags_zh": "半闭眼, 困倦, 放松",
    "categories": ["眼神 (Eyes)"],
    "traits": ["half-closed eyes", "sleepy", "relaxed"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_eyes_0003",
    "name": "Wide Eyes",
    "name_zh": "睁大眼",
    "tags": "wide eyes, surprised, staring,",
    "tags_zh": "睁大眼, 惊讶, 凝视",
    "categories": ["眼神 (Eyes)"],
    "traits": ["wide eyes", "surprised", "staring"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_eyes_0004",
    "name": "Sparkling Eyes",
    "name_zh": "闪亮眼",
    "tags": "sparkling eyes, starry eyes, excited,",
    "tags_zh": "闪亮眼, 星星眼, 兴奋",
    "categories": ["眼神 (Eyes)"],
    "traits": ["sparkling eyes", "starry eyes", "excited"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_eyes_0005",
    "name": "Heart-Shaped Pupils",
    "name_zh": "爱心眼",
    "tags": "heart-shaped pupils, heart eyes, love,",
    "tags_zh": "爱心瞳孔, 爱心眼, 喜爱",
    "categories": ["眼神 (Eyes)"],
    "traits": ["heart-shaped pupils", "love", "eyes"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_face_0001",
    "name": "Blush",
    "name_zh": "脸红",
    "tags": "blush, embarrassed, red cheeks,",
    "tags_zh": "脸红, 害羞, 红脸颊",
    "categories": ["脸部状态 (Face Detail)"],
    "traits": ["blush", "red cheeks", "embarrassed"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_face_0002",
    "name": "Sweatdrop",
    "name_zh": "汗滴",
    "tags": "sweatdrop, nervous, embarrassed,",
    "tags_zh": "汗滴, 紧张, 尴尬",
    "categories": ["脸部状态 (Face Detail)"],
    "traits": ["sweatdrop", "nervous", "embarrassed"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_face_0003",
    "name": "Expressionless",
    "name_zh": "无表情",
    "tags": "expressionless, blank stare, emotionless,",
    "tags_zh": "无表情, 空洞凝视, 冷淡",
    "categories": ["脸部状态 (Face Detail)"],
    "traits": ["expressionless", "blank stare", "emotionless"],
    "folder": "images",
    "preview": ""
  },
  {
    "id": "expression_face_0004",
    "name": "Smug",
    "name_zh": "得意",
    "tags": "smug, smug face, confident,",
    "tags_zh": "得意, 得意脸, 自信",
    "categories": ["脸部状态 (Face Detail)"],
    "traits": ["smug", "confident", "face"],
    "folder": "images",
    "preview": ""
  }
];

if (typeof window !== "undefined") {
  window.expressionData = expressionData;
}

export { expressionData };
