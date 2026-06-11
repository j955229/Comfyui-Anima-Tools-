class AnimaArtistTagSelector:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "artist_tags": ("STRING", {"multiline": True, "default": ""}),
                "mode": (["append", "override"], {"default": "append"}),
            },
            "optional": {
                "opt_prompt": ("STRING", {"forceInput": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process_tags"
    CATEGORY = "AnimaArt"
    def process_tags(self, artist_tags, mode, opt_prompt=""):
        tags_list = [t.strip() for t in artist_tags.split(",") if t.strip()]
        processed_tags = []
        for tag in tags_list:
            if tag.startswith("_raw_:"):
                processed_tags.append(tag[6:])
                continue
            clean_tag = tag
            if clean_tag.startswith("@"):
                clean_tag = clean_tag[1:].strip()
            elif clean_tag.lower().startswith("by "):
                clean_tag = clean_tag[3:].strip()
            if clean_tag:
                processed_tags.append(f"@{clean_tag}")
        joined_artists = ", ".join(processed_tags)

        # 结合外部 prompt
        if opt_prompt and opt_prompt.strip():
            opt_prompt = opt_prompt.strip()
            if mode == "append":
                # 追加模式：选择的画师 tag 在前，外接的 opt_prompt 在后，末尾补上逗号
                if joined_artists:
                    if opt_prompt.endswith(","):
                        final_text = f"{joined_artists}, {opt_prompt}"
                    else:
                        final_text = f"{joined_artists}, {opt_prompt}, "
                else:
                    final_text = opt_prompt
            else:
                # 覆盖模式：直接输出画师 tags，并在末尾带上逗号
                if joined_artists:
                    final_text = f"{joined_artists}, "
                else:
                    final_text = ""
        else:
            if joined_artists:
                final_text = f"{joined_artists}, "
            else:
                final_text = ""

        return (final_text,)

class AnimaArtistTagSelectorPlus:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "artist_tags": ("STRING", {"multiline": True, "default": ""}),
                "extra_text": ("STRING", {"multiline": True, "default": ""}),
                "separator": ("STRING", {"default": ", "}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process_tags"
    CATEGORY = "AnimaArt"

    def process_tags(self, artist_tags, extra_text, separator=", "):
        # 1. 过滤并处理画师 tags
        tags_list = [t.strip() for t in artist_tags.split(",") if t.strip()]
        processed_tags = []
        
        for tag in tags_list:
            if tag.startswith("_raw_:"):
                processed_tags.append(tag[6:])
                continue
            clean_tag = tag
            if clean_tag.startswith("@"):
                clean_tag = clean_tag[1:].strip()
            elif clean_tag.lower().startswith("by "):
                clean_tag = clean_tag[3:].strip()
            
            if clean_tag:
                processed_tags.append(f"@{clean_tag}")
        
        joined_artists = ", ".join(processed_tags)
        # 🌟 只要有画师，尾部必带逗号与空格，保证输出框及默认状态下的绝对完美隔开
        if joined_artists:
            joined_artists += ", "

        # 2. 将两段自动拼接到一起 (画师在前，自定义提示词在后)
        extra_text_clean = extra_text.strip() if extra_text else ""
        
        if extra_text_clean and joined_artists:
            # 画师在前，提示词在后
            # 🌟 智能合并去重：如果分隔符是逗号或被删空，则直接利用 joined_artists 尾部的逗号连接，避免产生多余的双逗号
            sep = separator if separator is not None else ", "
            if sep.strip() == "," or sep.strip() == "":
                final_text = f"{joined_artists}{extra_text_clean}"
            else:
                # 否则，剥离画师尾部逗号，使用用户填写的自定义非逗号分隔符连接
                final_text = f"{joined_artists.rstrip(', ')}{sep}{extra_text_clean}"
        elif extra_text_clean:
            final_text = extra_text_clean
        else:
            final_text = joined_artists

        return (final_text,)

class AnimaCharacterTagSelector:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "character_tags": ("STRING", {"multiline": True, "default": ""}),
                "mode": (["append", "override"], {"default": "append"}),
            },
            "optional": {
                "opt_prompt": ("STRING", {"forceInput": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process_tags"
    CATEGORY = "AnimaArt"

    def process_tags(self, character_tags, mode, opt_prompt=""):
        tags_list = [t.strip() for t in character_tags.split(",") if t.strip()]
        processed_tags = []
        
        for tag in tags_list:
            if tag.startswith("_raw_:"):
                processed_tags.append(tag[6:])
                continue
            clean_tag = tag
            if clean_tag.startswith("@"):
                clean_tag = clean_tag[1:].strip()
            
            if clean_tag:
                processed_tags.append(clean_tag)
        
        joined_characters = ", ".join(processed_tags)

        if opt_prompt and opt_prompt.strip():
            opt_prompt = opt_prompt.strip()
            if mode == "append":
                # 追加模式：选择的角色 tag 在前，外接的 opt_prompt 在后，末尾补上逗号
                if joined_characters:
                    if opt_prompt.endswith(","):
                        final_text = f"{joined_characters}, {opt_prompt}"
                    else:
                        final_text = f"{joined_characters}, {opt_prompt}, "
                else:
                    final_text = opt_prompt
            else:
                if joined_characters:
                    final_text = f"{joined_characters}, "
                else:
                    final_text = ""
        else:
            if joined_characters:
                final_text = f"{joined_characters}, "
            else:
                final_text = ""

        return (final_text,)

class AnimaCharacterTagSelectorPlus:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "character_tags": ("STRING", {"multiline": True, "default": ""}),
                "extra_text": ("STRING", {"multiline": True, "default": ""}),
                "separator": ("STRING", {"default": ", "}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "process_tags"
    CATEGORY = "AnimaArt"

    def process_tags(self, character_tags, extra_text, separator=", "):
        tags_list = [t.strip() for t in character_tags.split(",") if t.strip()]
        processed_tags = []
        
        for tag in tags_list:
            if tag.startswith("_raw_:"):
                processed_tags.append(tag[6:])
                continue
            clean_tag = tag
            if clean_tag.startswith("@"):
                clean_tag = clean_tag[1:].strip()
            
            if clean_tag:
                processed_tags.append(clean_tag)
        
        joined_characters = ", ".join(processed_tags)
        if joined_characters:
            joined_characters += ", "

        extra_text_clean = extra_text.strip() if extra_text else ""
        
        if extra_text_clean and joined_characters:
            sep = separator if separator is not None else ", "
            if sep.strip() == "," or sep.strip() == "":
                final_text = f"{joined_characters}{extra_text_clean}"
            else:
                final_text = f"{joined_characters.rstrip(', ')}{sep}{extra_text_clean}"
        elif extra_text_clean:
            final_text = extra_text_clean
        else:
            final_text = joined_characters

        return (final_text,)

class AnimaMultiLoraLoader:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "model": ("MODEL",),
                "clip": ("CLIP",),
                "lora_list_json": ("STRING", {"default": "[]", "multiline": True}),
            }
        }

    RETURN_TYPES = ("MODEL", "CLIP")
    RETURN_NAMES = ("MODEL", "CLIP")
    FUNCTION = "load_loras"
    CATEGORY = "AnimaArt"

    def load_loras(self, model, clip, lora_list_json):
        import json
        import comfy.sd
        import comfy.utils
        import folder_paths
        from .anima_lora_api import get_lora_save_dir
        
        try:
            loras = json.loads(lora_list_json)
        except Exception as e:
            print(f"[Anima Tools] Error parsing lora_list_json: {e}")
            loras = []
            
        current_model = model
        current_clip = clip
        
        for lora_entry in loras:
            if not lora_entry.get("enabled", True):
                continue
                
            lora_name = lora_entry.get("name")
            strength_model = float(lora_entry.get("strength_model", 1.0))
            strength_clip = float(lora_entry.get("strength_clip", 1.0))
            
            if not lora_name:
                continue
                
            # 查找 LoRA 文件路径
            lora_path = folder_paths.get_full_path("loras", lora_name)
            
            if not lora_path:
                custom_dir = get_lora_save_dir()
                candidate = os.path.join(custom_dir, lora_name)
                if os.path.isfile(candidate):
                    lora_path = candidate
                else:
                    candidate_rel = os.path.join(custom_dir, lora_name.replace("/", os.sep))
                    if os.path.isfile(candidate_rel):
                        lora_path = candidate_rel
            
            if not lora_path:
                # 模糊匹配
                found_match = False
                for system_lora in folder_paths.get_filename_list("loras"):
                    if os.path.basename(system_lora) == os.path.basename(lora_name):
                        lora_path = folder_paths.get_full_path("loras", system_lora)
                        found_match = True
                        break
                if not found_match:
                    print(f"[Anima Tools] LoRA file not found: {lora_name}, skipping.")
                    continue
                    
            try:
                print(f"[Anima Tools] Applying LoRA: {lora_name} -> Model Strength: {strength_model}, Clip Strength: {strength_clip}")
                lora_data = comfy.utils.load_torch_file(lora_path, safe_load=True)
                current_model, current_clip = comfy.sd.load_lora_for_models(
                    current_model, current_clip, lora_data, strength_model, strength_clip
                )
            except Exception as e:
                print(f"[Anima Tools] Failed to load LoRA {lora_name}: {e}")
                
        return (current_model, current_clip)


NODE_CLASS_MAPPINGS = {
    "AnimaArtistTagSelector": AnimaArtistTagSelector,
    "AnimaArtistTagSelectorPlus": AnimaArtistTagSelectorPlus,
    "AnimaCharacterTagSelector": AnimaCharacterTagSelector,
    "AnimaCharacterTagSelectorPlus": AnimaCharacterTagSelectorPlus,
    "AnimaMultiLoraLoader": AnimaMultiLoraLoader
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "AnimaArtistTagSelector": "Anima Artist Tag Selector",
    "AnimaArtistTagSelectorPlus": "Anima Artist Tag Selector+",
    "AnimaCharacterTagSelector": "Anima Character Tag Selector",
    "AnimaCharacterTagSelectorPlus": "Anima Character Tag Selector+",
    "AnimaMultiLoraLoader": "Anima Multi LoRA Loader"
}

# ----------------- 后端持久化 API 路由 -----------------
import folder_paths
from server import PromptServer
from aiohttp import web
import json
import os
import hashlib
import threading

def get_favorites_path():
    try:
        user_dir = folder_paths.get_user_directory()
    except AttributeError:
        # 降级方案：寻找 ComfyUI 根目录下的 user 文件夹
        user_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "user"))
        if not os.path.exists(user_dir):
            user_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "user"))
    
    os.makedirs(user_dir, exist_ok=True)
    return os.path.join(user_dir, "anima_tools_favorites.json")

@PromptServer.instance.routes.get("/anima-tools/favorites")
async def get_favorites_api(request):
    path = get_favorites_path()
    default_data = {
        "artist": {
            "groups": [{"id": "default", "name": "默认收藏", "isSystem": True}],
            "items": []
        },
        "character": {
            "groups": [{"id": "default", "name": "默认收藏", "isSystem": True}],
            "items": []
        },
        "lora": {
            "groups": [{"id": "default", "name": "默认收藏", "isSystem": True}],
            "items": []
        }
    }
    
    if not os.path.exists(path):
        return web.json_response(default_data)
        
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                data = {}
            for key in ["artist", "character", "lora"]:
                if key not in data or not isinstance(data[key], dict):
                    data[key] = default_data[key]
                if "groups" not in data[key] or not isinstance(data[key]["groups"], list):
                    data[key]["groups"] = default_data[key]["groups"]
                if "items" not in data[key] or not isinstance(data[key]["items"], list):
                    data[key]["items"] = []
                # 确保默认收藏分组存在
                if not any(g.get("id") == "default" for g in data[key]["groups"]):
                    data[key]["groups"].insert(0, default_data[key]["groups"][0])
            return web.json_response(data)
    except Exception as e:
        print(f"[Anima Tools] Error reading favorites: {e}")
        return web.json_response(default_data)

@PromptServer.instance.routes.post("/anima-tools/favorites")
async def save_favorites_api(request):
    try:
        body = await request.json()
        path = get_favorites_path()
        
        # 原子写入：先写入 .tmp 文件再覆盖
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(body, f, indent=2, ensure_ascii=False)
            
        os.replace(tmp_path, path)
        return web.json_response({"success": True})
    except Exception as e:
        print(f"[Anima Tools] Error saving favorites: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


# ----------------- LoRA 相关的 API 路由 -----------------
from .anima_lora_api import (
    search_civitai_loras,
    start_download_task,
    get_download_job_status,
    load_config as load_lora_config,
    save_config as save_lora_config,
    get_lora_save_dir,
    download_preview_image,
    fetch_civitai_model
)

def scan_loras_in_directory(directory: str) -> list:
    results = []
    if not directory or not os.path.isdir(directory):
        return results
    directory = os.path.abspath(directory)
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".safetensors"):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, directory)
                rel_path = rel_path.replace(os.sep, "/")
                results.append(rel_path)
    return results

@PromptServer.instance.routes.get("/anima-tools/lora/local")
async def lora_local_list_api(request):
    try:
        # 1. Resolve Default Download Location
        try:
            roots = folder_paths.get_folder_paths("loras")
            default_dir = roots[0] if (roots and os.path.isdir(roots[0])) else None
        except Exception:
            default_dir = None
            
        if not default_dir:
            default_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "loras"))
            
        # 2. Resolve User's Custom Download Location
        config = load_lora_config()
        custom_dir = config.get("custom_lora_dir", "").strip()
        
        local_loras = []
        seen = set()
        
        # Scan default directory
        if default_dir and os.path.isdir(default_dir):
            for path in scan_loras_in_directory(default_dir):
                if path not in seen:
                    seen.add(path)
                    local_loras.append(path)
                    
        # Scan custom user directory
        if custom_dir and os.path.isdir(custom_dir) and os.path.abspath(custom_dir) != os.path.abspath(default_dir):
            for path in scan_loras_in_directory(custom_dir):
                if path not in seen:
                    seen.add(path)
                    local_loras.append(path)
                    
        return web.json_response(local_loras)
    except Exception as e:
        print(f"[Anima Tools] Local LoRA List API error: {e}")
        return web.json_response([], status=500)

@PromptServer.instance.routes.get("/anima-tools/lora/search")
async def lora_search_api(request):
    try:
        query = request.query.get("query", "")
        tag = request.query.get("tag", "")
        sort = request.query.get("sort", "Highest Rated")
        cursor = request.query.get("cursor", "")
        limit_str = request.query.get("limit", "40")
        try:
            limit = int(limit_str)
        except ValueError:
            limit = 40
            
        result = search_civitai_loras(query=query, tag=tag, sort=sort, cursor=cursor, limit=limit)
        return web.json_response(result or {"items": [], "metadata": {}})
    except Exception as e:
        print(f"[Anima Tools] Search API error: {e}")
        return web.json_response({"items": [], "error": str(e)}, status=500)

@PromptServer.instance.routes.post("/anima-tools/lora/download")
async def lora_download_api(request):
    try:
        body = await request.json()
        version_id = body.get("version_id")
        download_url = body.get("download_url")
        filename = body.get("filename")
        metadata = body.get("metadata")
        
        if not version_id or not download_url or not filename:
            return web.json_response({"success": False, "error": "Missing parameters"}, status=400)
            
        task_id = start_download_task(version_id, download_url, filename, metadata=metadata)
        return web.json_response({"success": True, "task_id": task_id})
    except Exception as e:
        print(f"[Anima Tools] Download API error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


_LOCAL_METADATA_CACHE = {}

def get_info_from_civitai_by_hash(file_hash: str) -> dict | None:
    import urllib.request
    import json
    url = f"https://civitai.red/api/v1/model-versions/by-hash/{file_hash}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None

@PromptServer.instance.routes.get("/anima-tools/lora/local-metadata")
async def lora_local_metadata_api(request):
    try:
        filename = request.query.get("filename", "")
        if not filename:
            return web.json_response({"success": False, "error": "Missing filename"}, status=400)
            
        filename = filename.replace("\\", "/")
        
        # Try metadata cache first
        if filename in _LOCAL_METADATA_CACHE:
            return web.json_response({"success": True, "metadata": _LOCAL_METADATA_CACHE[filename]})
            
        try:
            abs_path = folder_paths.get_full_path("loras", filename)
        except Exception:
            abs_path = None
            
        if not abs_path or not os.path.exists(abs_path):
            save_dir = get_lora_save_dir()
            abs_path = os.path.join(save_dir, filename)
            
        if os.path.exists(abs_path):
            meta_path = os.path.splitext(abs_path)[0] + ".json"
            
            # 1. 优先读取已存在的本地 JSON 配置文件（支持旧版格式自动升级与自愈）
            if os.path.exists(meta_path):
                try:
                    with open(meta_path, "r", encoding="utf-8") as f:
                        meta_data = json.load(f)
                    # 检查是否是包含 files、modelVersions 和 creator（作者）的新版完整格式，如果是则直接返回
                    if (isinstance(meta_data, dict) and 
                        "version" in meta_data and "files" in meta_data["version"] and 
                        "model" in meta_data and "modelVersions" in meta_data["model"] and
                        "creator" in meta_data["model"]):
                        _LOCAL_METADATA_CACHE[filename] = meta_data
                        return web.json_response({"success": True, "metadata": meta_data})
                    else:
                        print(f"[Anima Tools] Legacy local metadata found for {filename}, regenerating to fetch complete fields...")
                except Exception:
                    pass
                
            # 2. 如果不存在（或为旧版非完整格式），计算 SHA256 哈希值，从 Civitai 反向抓取元数据
            print(f"[Anima Tools] Resolving complete metadata for {filename}...")
            try:
                h = hashlib.sha256()
                with open(abs_path, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096 * 1024), b''): # 4MB chunk
                        h.update(chunk)
                file_hash = h.hexdigest().upper()
                
                info = get_info_from_civitai_by_hash(file_hash)
                if info and "error" not in info:
                    # 二次查询模型完整元数据，获取作者 (creator) 及其它版本详情和高质量预览图
                    model_id = info.get("modelId")
                    full_model = None
                    if model_id:
                        try:
                            full_model = fetch_civitai_model(model_id)
                        except Exception:
                            full_model = None
                            
                    # 组装符合前端所需的全包元数据格式
                    version_info = {
                        "id": info.get("id"),
                        "name": info.get("name"),
                        "trainedWords": info.get("trainedWords", []),
                        "images": info.get("images", []),
                        "files": info.get("files", []),
                        "downloadUrl": info.get("downloadUrl", ""),
                        "description": info.get("description", "")
                    }
                    
                    if full_model and "error" not in full_model:
                        model_info = full_model.copy()
                        # 补全或覆盖 modelVersions
                        model_info["modelVersions"] = full_model.get("modelVersions", [version_info])
                    else:
                        model_info = info.get("model", {}).copy()
                        model_info["modelVersions"] = [version_info]
                        model_info["description"] = info.get("description", "")
                    
                    meta_data = {
                        "model": model_info,
                        "version": version_info
                    }
                    # 自动保存本地同名 JSON 伴随文件，后续便可秒开
                    with open(meta_path, "w", encoding="utf-8") as f:
                        json.dump(meta_data, f, indent=2, ensure_ascii=False)
                        
                    # 尝试自动补齐本地 LoRA 的封面图！这样之前没有封面图的也能自动显示 C 站封面
                    images = info.get("images", [])
                    if images:
                        preview_url = images[0].get("url")
                        if preview_url:
                            preview_ext = ".png"
                            if ".jpg" in preview_url.lower() or ".jpeg" in preview_url.lower():
                                preview_ext = ".jpg"
                            elif ".webp" in preview_url.lower():
                                preview_ext = ".webp"
                            
                            preview_path = os.path.splitext(abs_path)[0] + preview_ext
                            if not os.path.exists(preview_path):
                                # 后台多线程异步下载图片，防止阻塞 metadata 请求
                                threading.Thread(
                                    target=download_preview_image,
                                    args=(preview_url, preview_path),
                                    daemon=True
                                ).start()
                                
                    _LOCAL_METADATA_CACHE[filename] = meta_data
                    return web.json_response({"success": True, "metadata": meta_data})
            except Exception as ex:
                print(f"[Anima Tools] Auto-metadata recovery failed for {filename}: {ex}")
                
        return web.json_response({"success": False, "error": "Metadata not found"}, status=404)
    except Exception as e:
        print(f"[Anima Tools] Get Local Metadata API error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


@PromptServer.instance.routes.get("/anima-tools/lora/local-preview")
async def lora_local_preview_api(request):
    try:
        filename = request.query.get("filename", "")
        if not filename:
            return web.Response(status=400)
            
        # 统一将反斜杠替换为正斜杠，防止 Windows 路径转义解析错误
        filename = filename.replace("\\", "/")
        
        try:
            abs_path = folder_paths.get_full_path("loras", filename)
        except Exception:
            abs_path = None
            
        if not abs_path or not os.path.exists(abs_path):
            save_dir = get_lora_save_dir()
            abs_path = os.path.join(save_dir, filename)
            
        if os.path.exists(abs_path):
            base_no_ext = os.path.splitext(abs_path)[0]
            for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm"]:
                preview_file = base_no_ext + ext
                if os.path.exists(preview_file):
                    return web.FileResponse(preview_file)
                    
        # 找不到本地预览图时，返回默认的 No Preview 占位图，状态设为 200，防止控制台大量 404 报错
        svg_content = (
            "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>"
            "<rect width='100' height='100' fill='#222'/>"
            "<text x='50%' y='50%' font-size='10' fill='#666' dominant-baseline='middle' text-anchor='middle'>No Preview</text>"
            "</svg>"
        )
        return web.Response(body=svg_content, content_type="image/svg+xml")
    except Exception as e:
        print(f"[Anima Tools] Local Preview API error: {e}")
        return web.Response(status=500)

@PromptServer.instance.routes.get("/anima-tools/lora/download-status")
async def lora_download_status_api(request):
    try:
        task_id = request.query.get("task_id", "")
        if not task_id:
            from .anima_lora_api import get_all_download_jobs
            return web.json_response(get_all_download_jobs())
            
        status_info = get_download_job_status(task_id)
        if not status_info:
            return web.json_response({"status": "not_found"}, status=404)
        return web.json_response(status_info)
    except Exception as e:
        print(f"[Anima Tools] Download Status API error: {e}")
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.get("/anima-tools/lora/config")
async def lora_get_config_api(request):
    try:
        config = load_lora_config()
        config["resolved_save_dir"] = get_lora_save_dir()
        return web.json_response(config)
    except Exception as e:
        print(f"[Anima Tools] Get Config API error: {e}")
        return web.json_response({"error": str(e)}, status=500)

@PromptServer.instance.routes.post("/anima-tools/lora/config")
async def lora_save_config_api(request):
    try:
        body = await request.json()
        config = load_lora_config()
        if "custom_lora_dir" in body:
            config["custom_lora_dir"] = body["custom_lora_dir"]
        if "civitai_api_key" in body:
            config["civitai_api_key"] = body["civitai_api_key"]
            
        success = save_lora_config(config)
        return web.json_response({"success": success, "resolved_save_dir": get_lora_save_dir()})
    except Exception as e:
        print(f"[Anima Tools] Save Config API error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


def delete_local_lora_files(filename: str) -> bool:
    """Helper to delete a local LoRA model and its companion meta files."""
    try:
        # 统一将反斜杠替换为正斜杠，防止 Windows 路径转义解析错误
        filename = filename.replace("\\", "/")
        
        # Invalidate metadata cache
        _LOCAL_METADATA_CACHE.pop(filename, None)
        
        try:
            abs_path = folder_paths.get_full_path("loras", filename)
        except Exception:
            abs_path = None
            
        if not abs_path or not os.path.exists(abs_path):
            abs_path = os.path.join(get_lora_save_dir(), filename)
            
        if not abs_path:
            return False
            
        abs_path = os.path.normpath(abs_path)
        
        if not os.path.exists(abs_path):
            # 如果主模型文件都不存在，我们也尝试看看有没有残留的伴随文件
            print(f"[Anima Tools] Model file {abs_path} not found, checking companion files...")
            
        # 1. 尝试删除 companion JSON metadata
        base_no_ext = os.path.splitext(abs_path)[0]
        meta_file = base_no_ext + ".json"
        deleted_any = False
        
        if os.path.exists(meta_file):
            try:
                os.remove(meta_file)
                print(f"[Anima Tools] Successfully deleted companion meta JSON: {meta_file}")
                deleted_any = True
            except Exception as e:
                print(f"[Anima Tools] Failed to delete companion meta JSON {meta_file}: {e}")
                
        # 2. 尝试删除 companion preview images (支持同名和带 .preview 后缀的预览图)
        preview_extensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".webm"]
        for ext in preview_extensions:
            for suffix in ["", ".preview"]:
                preview_file = base_no_ext + suffix + ext
                if os.path.exists(preview_file):
                    try:
                        os.remove(preview_file)
                        print(f"[Anima Tools] Successfully deleted preview image: {preview_file}")
                        deleted_any = True
                    except Exception as e:
                        print(f"[Anima Tools] Failed to delete preview image {preview_file}: {e}")
                    
        # 3. 尝试删除主模型文件
        model_deleted = False
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
                print(f"[Anima Tools] Successfully deleted main model file: {abs_path}")
                model_deleted = True
            except Exception as e:
                print(f"[Anima Tools] Failed to delete main model file {abs_path} (it might be locked or in-use by ComfyUI): {e}")
                
        return model_deleted or deleted_any
    except Exception as e:
        print(f"[Anima Tools] Error deleting local LoRA files: {e}")
        return False


@PromptServer.instance.routes.post("/anima-tools/lora/delete-local")
async def lora_delete_local_api(request):
    try:
        body = await request.json()
        filename = body.get("filename", "")
        if not filename:
            return web.json_response({"success": False, "error": "Missing filename"}, status=400)
            
        success = delete_local_lora_files(filename)
        if success:
            # Refresh local lists in memory if cached, though ComfyUI usually handles dynamically
            return web.json_response({"success": True})
        else:
            return web.json_response({"success": False, "error": "File not found or failed to delete"}, status=404)
    except Exception as e:
        print(f"[Anima Tools] Delete Local API error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


