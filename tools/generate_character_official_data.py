from __future__ import annotations

import json
import re
import time
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CHARACTER_DATA = ROOT / "js" / "character_data.js"
OUTPUT = ROOT / "js" / "character_official_data.json"
SEARCH_API = "https://animadex.net/api/characters/search"


def normalize(value: str | None) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("_", " ").strip().lower())


def key_for(name: str | None, copyright: str | None) -> str:
    return f"{normalize(name)}||{normalize(copyright)}"


def load_local_characters() -> list[dict]:
    raw = CHARACTER_DATA.read_text(encoding="utf-8")
    raw = re.sub(r"^const characterData = ", "", raw)
    raw = re.sub(r";\s*window\.characterData = characterData;\s*$", "", raw)
    return json.loads(raw)


def fetch_page(page: int) -> dict:
    req = urllib.request.Request(
        f"{SEARCH_API}?sort=count&page={page}",
        headers={
            "User-Agent": "ComfyUI-Anima-Tools/official-tags-generator",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> None:
    local = load_local_characters()
    local_keys = {key_for(item.get("name"), item.get("copyright")) for item in local}
    min_count = min(int(item.get("post_count") or 0) for item in local)

    official: dict[str, dict] = {}
    page = 1
    total_pages = 1

    while page <= total_pages and len(official) < len(local_keys):
        data = fetch_page(page)
        total_pages = int(data.get("pages") or total_pages)
        rows = data.get("results") or []
        if not rows:
            break

        page_min = min(int(row.get("count") or 0) for row in rows)
        for row in rows:
            key = key_for(row.get("slug"), row.get("copyright"))
            if key in local_keys and key not in official:
                official[key] = {
                    "trigger": row.get("trigger") or "",
                    "tags": row.get("tags") if isinstance(row.get("tags"), list) else [],
                }

        if page % 25 == 0:
            print(f"page={page} matched={len(official)}/{len(local_keys)}", flush=True)
        if page_min < min_count:
            break

        page += 1
        time.sleep(0.04)

    OUTPUT.write_text(
        json.dumps(official, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(
        f"done pages={page} matched={len(official)}/{len(local_keys)} "
        f"minLocal={min_count} bytes={OUTPUT.stat().st_size}",
        flush=True,
    )


if __name__ == "__main__":
    main()
