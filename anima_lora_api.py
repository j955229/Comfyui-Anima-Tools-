"""Anima LoRA API integration for ComfyUI Anima Tools.

Provides backend API wrappers, config loading/saving, and background downloader.
"""

import json
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import folder_paths

CIVITAI_API_BASE = "https://civitai.red/api/v1"
USER_AGENT = "ComfyUI-Anima-Tools/1.0"
VALID_IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp")

# Thread-safe download tracking
_DOWNLOAD_JOBS = {}
_DOWNLOAD_JOBS_LOCK = threading.Lock()


def get_config_path() -> str:
    """Gets the path to the anima_lora_config.json configuration file."""
    try:
        user_dir = folder_paths.get_user_directory()
    except AttributeError:
        user_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "user"))
        if not os.path.exists(user_dir):
            user_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "user"))
    
    os.makedirs(user_dir, exist_ok=True)
    return os.path.join(user_dir, "anima_lora_config.json")


_LORA_CONFIG_CACHE = None


def load_config() -> dict:
    """Loads configuration dictionary."""
    global _LORA_CONFIG_CACHE
    if _LORA_CONFIG_CACHE is not None:
        return _LORA_CONFIG_CACHE
    path = get_config_path()
    default_config = {
        "custom_lora_dir": "",
        "civitai_api_key": ""
    }
    if not os.path.exists(path):
        _LORA_CONFIG_CACHE = default_config
        return default_config
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, dict):
                _LORA_CONFIG_CACHE = {**default_config, **data}
                return _LORA_CONFIG_CACHE
    except Exception as e:
        print(f"[Anima Tools] Error loading config: {e}")
    _LORA_CONFIG_CACHE = default_config
    return default_config


def save_config(config: dict) -> bool:
    """Saves configuration dictionary."""
    global _LORA_CONFIG_CACHE
    path = get_config_path()
    try:
        tmp_path = path + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        os.replace(tmp_path, path)
        _LORA_CONFIG_CACHE = config
        return True
    except Exception as e:
        print(f"[Anima Tools] Error saving config: {e}")
        return False


def get_lora_save_dir() -> str:
    """Resolves directory path where downloaded LoRA models should be saved."""
    config = load_config()
    custom_dir = config.get("custom_lora_dir", "").strip()
    if custom_dir and os.path.isdir(custom_dir):
        return custom_dir
    
    # Fallback to ComfyUI LoRAs directories
    try:
        roots = folder_paths.get_folder_paths("loras")
        if roots and os.path.isdir(roots[0]):
            return roots[0]
    except Exception:
        pass
    
    # Deep fallback to models/loras
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models", "loras"))
    os.makedirs(base_dir, exist_ok=True)
    return base_dir


def _request_headers(api_key: str | None = None, json_content: bool = True) -> dict:
    headers = {"User-Agent": USER_AGENT}
    if json_content:
        headers["Content-Type"] = "application/json"
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    return headers


def _read_json_url(url: str, api_key: str | None = None, timeout: int = 30) -> dict | None:
    req = urllib.request.Request(url, headers=_request_headers(api_key), method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[Anima Tools] Civitai API error {e.code}: {e.reason} at {url}")
        return None
    except urllib.error.URLError as e:
        print(f"[Anima Tools] Civitai connection error: {e.reason} at {url}")
        return None
    except Exception as e:
        print(f"[Anima Tools] Civitai unexpected error: {e}")
        return None


def search_civitai_loras(query: str = "", tag: str = "", sort: str = "Highest Rated", cursor: str = "", limit: int = 40) -> dict | None:
    """Searches Civitai API for LoRA models based on Anima."""
    config = load_config()
    api_key = config.get("civitai_api_key", "").strip() or None
    
    params = {
        "limit": str(max(1, min(limit, 100))),
        "types": "LORA",
        "sortBy": sort,
        "nsfw": "true",
        "baseModels": "Anima",  # Enforce matching Anima base model only
    }
    
    clean_query = str(query or "").strip()
    clean_tag = str(tag or "").strip()
    clean_cursor = str(cursor or "").strip()
    
    if clean_query:
        params["query"] = clean_query
    if clean_tag:
        params["tag"] = clean_tag
    if clean_cursor:
        params["cursor"] = clean_cursor
        
    encoded = urllib.parse.urlencode(params)
    url = f"{CIVITAI_API_BASE}/models?{encoded}"
    return _read_json_url(url, api_key=api_key)


def fetch_civitai_model(model_id: int | str) -> dict | None:
    """Fetches full model metadata by id."""
    config = load_config()
    api_key = config.get("civitai_api_key", "").strip() or None
    
    url = f"{CIVITAI_API_BASE}/models/{model_id}"
    return _read_json_url(url, api_key=api_key)


def download_preview_image(image_url: str, save_path: str) -> bool:
    """Downloads preview image from Civitai."""
    try:
        # Append width=512 for optimization if not already present
        if "width=" not in image_url:
            separator = "&" if "?" in image_url else "?"
            image_url = f"{image_url}{separator}width=512"
            
        req = urllib.request.Request(image_url, headers=_request_headers(json_content=False))
        with urllib.request.urlopen(req, timeout=30) as resp:
            image_data = resp.read()
            
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        with open(save_path, "wb") as f:
            f.write(image_data)
        return True
    except Exception as e:
        print(f"[Anima Tools] Failed to download preview image: {e}")
        return False


def _download_thread(task_id: str, download_url: str, save_path: str, api_key: str | None = None, metadata: dict = None):
    """Worker thread function to execute download and update task status."""
    temp_path = f"{save_path}.download"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    try:
        req_url = download_url
        if "civitai.com" in req_url:
            req_url = req_url.replace("civitai.com", "civitai.red")
            
        if api_key:
            # Append token to URL if not already present
            parsed = urllib.parse.urlparse(req_url)
            query = urllib.parse.parse_qs(parsed.query)
            if "token" not in query:
                query["token"] = [api_key]
                req_url = urllib.parse.urlunparse(parsed._replace(query=urllib.parse.urlencode(query, doseq=True)))
                
        req = urllib.request.Request(req_url, headers=_request_headers(api_key, json_content=False))
        
        with urllib.request.urlopen(req, timeout=60) as resp, open(temp_path, "wb") as f:
            total_size = int(resp.headers.get("Content-Length") or 0)
            downloaded = 0
            
            with _DOWNLOAD_JOBS_LOCK:
                _DOWNLOAD_JOBS[task_id]["total"] = total_size
                _DOWNLOAD_JOBS[task_id]["status"] = "downloading"
                
            while True:
                chunk = resp.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                f.write(chunk)
                downloaded += len(chunk)
                
                with _DOWNLOAD_JOBS_LOCK:
                    _DOWNLOAD_JOBS[task_id]["progress"] = downloaded
            
        os.replace(temp_path, save_path)
        
        # Save companion metadata JSON
        if metadata:
            meta_path = os.path.splitext(save_path)[0] + ".json"
            try:
                with open(meta_path, "w", encoding="utf-8") as f:
                    json.dump(metadata, f, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"[Anima Tools] Failed to save metadata json: {e}")
                
            # Download companion preview image
            try:
                version_info = metadata.get("version", {})
                images = version_info.get("images", [])
                if not images and isinstance(metadata.get("model"), dict):
                    images = metadata.get("model", {}).get("modelVersions", [{}])[0].get("images", [])
                
                if images:
                    preview_url = images[0].get("url")
                    if preview_url:
                        # Detect extension
                        preview_ext = ".png"
                        if ".jpg" in preview_url.lower() or ".jpeg" in preview_url.lower():
                            preview_ext = ".jpg"
                        elif ".webp" in preview_url.lower():
                            preview_ext = ".webp"
                            
                        preview_path = os.path.splitext(save_path)[0] + preview_ext
                        download_preview_image(preview_url, preview_path)
            except Exception as e:
                print(f"[Anima Tools] Failed to download companion preview: {e}")
                
        with _DOWNLOAD_JOBS_LOCK:
            _DOWNLOAD_JOBS[task_id]["status"] = "completed"
            _DOWNLOAD_JOBS[task_id]["progress"] = total_size
            
    except urllib.error.HTTPError as e:
        print(f"[Anima Tools] Download HTTP error for {task_id}: {e.code} - {e.reason}")
        error_msg = f"HTTP Error {e.code}: {e.reason}"
        if e.code == 401 or e.code == 403:
            error_msg = "HTTP Error 401: Unauthorized (此模型下载需要 Civitai API Key，请在设置中配置后再试)"
        with _DOWNLOAD_JOBS_LOCK:
            _DOWNLOAD_JOBS[task_id]["status"] = "failed"
            _DOWNLOAD_JOBS[task_id]["error"] = error_msg
    except Exception as e:
        print(f"[Anima Tools] Download thread failed for {task_id}: {e}")
        with _DOWNLOAD_JOBS_LOCK:
            _DOWNLOAD_JOBS[task_id]["status"] = "failed"
            _DOWNLOAD_JOBS[task_id]["error"] = str(e)
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass
 
 
def start_download_task(version_id: int | str, download_url: str, filename: str, metadata: dict = None) -> str:
    """Starts a background thread to download a model version."""
    task_id = str(version_id)
    save_dir = get_lora_save_dir()
    save_path = os.path.join(save_dir, filename)
    
    with _DOWNLOAD_JOBS_LOCK:
        if task_id in _DOWNLOAD_JOBS:
            status = _DOWNLOAD_JOBS[task_id]["status"]
            if status in ("pending", "downloading", "completed"):
                return task_id  # Already active or completed
                
        _DOWNLOAD_JOBS[task_id] = {
            "status": "pending",
            "progress": 0,
            "total": 0,
            "error": "",
            "save_path": save_path
        }
        
    config = load_config()
    api_key = config.get("civitai_api_key", "").strip() or None
    
    t = threading.Thread(
        target=_download_thread,
        args=(task_id, download_url, save_path, api_key, metadata),
        daemon=True
    )
    t.start()
    return task_id


def get_download_job_status(task_id: str) -> dict | None:
    """Gets current status of a download job."""
    with _DOWNLOAD_JOBS_LOCK:
        return _DOWNLOAD_JOBS.get(task_id)


def get_all_download_jobs() -> dict:
    """Gets all current active/cached download jobs."""
    with _DOWNLOAD_JOBS_LOCK:
        return dict(_DOWNLOAD_JOBS)
