import os
import json
import urllib.request
import urllib.parse
import re
from datetime import datetime
from PIL import Image

def run_download_and_organize():
    raw_json_path = "data/instagram/raw/embed_data.json"
    if not os.path.exists(raw_json_path):
        print(f"Error: {raw_json_path} not found.")
        return

    with open(raw_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    media_items = data.get("context", {}).get("graphql_media", [])
    print(f"[*] Processing {len(media_items)} posts...")

    base_media_dir = "data/instagram/media"
    organized_dir = "data/instagram/organized"
    os.makedirs(base_media_dir, exist_ok=True)
    os.makedirs(organized_dir, exist_ok=True)

    catalog = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Referer": "https://www.instagram.com/"
    }

    # Categories definition
    categories = {
        "magisterium": "01_magisterium_conferences",
        "podcast": "02_lets_talk_podcasts",
        "milestones_team": "03_club_milestones_team",
        "general": "04_general_events"
    }

    for cat_folder in categories.values():
        os.makedirs(os.path.join(organized_dir, cat_folder), exist_ok=True)

    for i, item in enumerate(media_items):
        sm = item.get("shortcode_media", {})
        shortcode = sm.get("shortcode", f"post_{i+1}")
        caption_edges = sm.get("edge_media_to_caption", {}).get("edges", [])
        caption = caption_edges[0]["node"]["text"] if caption_edges else ""
        typename = sm.get("__typename", "GraphImage")
        taken_at_ts = sm.get("taken_at_timestamp")
        date_str = datetime.utcfromtimestamp(taken_at_ts).strftime("%Y-%m-%d") if taken_at_ts else "unknown_date"
        likes = sm.get("edge_liked_by", {}).get("count") or sm.get("edge_media_preview_like", {}).get("count") or 0
        comments = sm.get("edge_media_to_comment", {}).get("count") or 0
        is_video = sm.get("is_video", False)
        
        # Categorization logic based on text and content
        caption_lower = caption.lower()
        if "magisterium" in caption_lower or "odontologie légale" in caption_lower:
            category_key = "magisterium"
            category_name = "Magisterium Conferences & Academic Events"
        elif "podcast" in caption_lower or "let’s talk" in caption_lower or "lets talk" in caption_lower:
            category_key = "podcast"
            category_name = "Let's Talk Podcast Series"
        elif "flambeau" in caption_lower or "page se tourne" in caption_lower or "famille" in caption_lower or "novembre 2024" in caption_lower:
            category_key = "milestones_team"
            category_name = "Club Milestones, Mandate & Team"
        else:
            category_key = "general"
            category_name = "General Club Events"

        cat_folder = categories[category_key]
        
        # Gather all media URLs (cover + carousel items)
        media_urls = []
        display_url = sm.get("display_url")
        if display_url:
            media_urls.append({"type": "cover", "url": display_url, "index": 0})
            
        sidecar_edges = sm.get("edge_sidecar_to_children", {}).get("edges", [])
        for c_idx, sc in enumerate(sidecar_edges):
            child_node = sc.get("node", {})
            c_url = child_node.get("display_url")
            if c_url and c_url != display_url:
                media_urls.append({"type": "sidecar_item", "url": c_url, "index": c_idx + 1})

        downloaded_files = []
        print(f"\n[{i+1}/{len(media_items)}] Downloading media for post {shortcode} ({category_name}) - {len(media_urls)} items...")
        
        for m_idx, m_info in enumerate(media_urls):
            filename = f"{date_str}_{shortcode}_{m_info['type']}_{m_info['index']}.jpg"
            dest_raw = os.path.join(base_media_dir, filename)
            dest_organized = os.path.join(organized_dir, cat_folder, filename)
            
            try:
                req = urllib.request.Request(m_info["url"], headers=headers)
                with urllib.request.urlopen(req, timeout=15) as resp:
                    img_bytes = resp.read()
                    with open(dest_raw, "wb") as img_f:
                        img_f.write(img_bytes)
                    with open(dest_organized, "wb") as img_f:
                        img_f.write(img_bytes)
                
                # Check dimensions
                with Image.open(dest_raw) as im:
                    width, height = im.size
                    img_format = im.format

                downloaded_files.append({
                    "filename": filename,
                    "relative_path": f"data/instagram/organized/{cat_folder}/{filename}",
                    "width": width,
                    "height": height,
                    "format": img_format,
                    "type": m_info["type"]
                })
                print(f"  ✓ Saved: {filename} ({width}x{height} {img_format})")
            except Exception as dl_err:
                print(f"  ✗ Failed to download {filename}: {dl_err}")

        post_record = {
            "shortcode": shortcode,
            "url": f"https://www.instagram.com/p/{shortcode}/",
            "date": date_str,
            "timestamp": taken_at_ts,
            "typename": typename,
            "is_video": is_video,
            "likes": likes,
            "comments": comments,
            "category": category_name,
            "category_folder": f"data/instagram/organized/{cat_folder}",
            "caption": caption,
            "media_count": len(downloaded_files),
            "media_files": downloaded_files
        }
        catalog.append(post_record)

    # Save master catalog
    catalog_path = "data/instagram/posts_catalog.json"
    with open(catalog_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"\n[✓] Finished processing! Catalog saved to {catalog_path} with {len(catalog)} posts and {sum(p['media_count'] for p in catalog)} total images.")
    return catalog

if __name__ == "__main__":
    run_download_and_organize()
