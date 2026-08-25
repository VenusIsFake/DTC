import os
import json
import time
import urllib.request
import urllib.parse
from datetime import datetime
import browser_cookie3
from PIL import Image

def fetch_all_posts():
    user_id = "69773816926"
    target_username = "dentalkclub_fmdc"
    
    print(f"[*] Extracting Chrome cookies for Instagram...")
    cj = browser_cookie3.chrome(domain_name="instagram.com")
    cookie_str = "; ".join([f"{c.name}={c.value}" for c in cj])
    csrf = next((c.value for c in cj if c.name == "csrftoken"), "")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "X-IG-App-ID": "936619743392459",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": csrf,
        "Cookie": cookie_str,
        "Referer": f"https://www.instagram.com/{target_username}/",
        "Accept": "*/*",
    }
    
    all_items = []
    seen_ids = set()
    next_max_id = None
    page = 1
    
    print(f"[*] Fetching full post timeline for @{target_username} (ID: {user_id})...")
    
    while True:
        url = f"https://www.instagram.com/api/v1/feed/user/{user_id}/?count=50"
        if next_max_id:
            url += f"&max_id={urllib.parse.quote(next_max_id)}"
            
        print(f"[Page {page}] Requesting: {url[:70]}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                
            items = data.get("items", [])
            new_items = 0
            for it in items:
                pk = str(it.get("pk") or it.get("id"))
                if pk not in seen_ids:
                    seen_ids.add(pk)
                    all_items.append(it)
                    new_items += 1
                    
            print(f"  ✓ Fetched {len(items)} items ({new_items} new). Total collected: {len(all_items)}")
            
            more_available = data.get("more_available", False)
            next_max_id = data.get("next_max_id")
            
            if not more_available or not next_max_id:
                print("[*] Reached end of timeline feed.")
                break
                
            page += 1
            time.sleep(1.5) # Polite delay
        except Exception as e:
            print(f"[!] Error fetching page {page}: {e}")
            break

    # Save full raw archive
    os.makedirs("instagram/metadata", exist_ok=True)
    archive_path = "instagram/metadata/all_posts_complete.json"
    with open(archive_path, "w", encoding="utf-8") as f:
        json.dump(all_items, f, indent=2, ensure_ascii=False)
    print(f"[✓] Saved raw feed archive to {archive_path} ({len(all_items)} total posts)")

    # Process and extract all media
    process_and_categorize(all_items)

def process_and_categorize(all_items):
    dest_root = "instagram"
    folders = {
        "events": os.path.join(dest_root, "events"),
        "podcasts": os.path.join(dest_root, "podcasts"),
        "team": os.path.join(dest_root, "team"),
        "awards": os.path.join(dest_root, "awards"),
        "magisterium": os.path.join(dest_root, "magisterium")
    }
    for f in folders.values():
        os.makedirs(f, exist_ok=True)
        
    posts_summary = []
    download_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.instagram.com/"
    }
    
    print(f"\n[*] Processing and organizing media from {len(all_items)} posts...")
    
    for idx, item in enumerate(all_items):
        shortcode = item.get("code") or item.get("shortcode") or f"item_{idx+1}"
        caption_obj = item.get("caption") or {}
        caption_text = caption_obj.get("text", "") if isinstance(caption_obj, dict) else str(caption_obj)
        taken_at = item.get("taken_at")
        date_str = datetime.fromtimestamp(taken_at).strftime("%Y-%m-%d") if taken_at else "unknown"
        likes = item.get("like_count", 0)
        comments = item.get("comment_count", 0)
        media_type = item.get("media_type") # 1: Image, 2: Video, 8: Carousel
        
        # Categorization
        cap_lower = caption_text.lower()
        if "tedx" in cap_lower or "brain rot" in cap_lower:
            category = "events"
            event_type = "TEDxFMDC"
        elif "débat" in cap_lower or "debat" in cap_lower or "table ronde" in cap_lower or "éloquence" in cap_lower or "eloquence" in cap_lower or "workshop" in cap_lower:
            category = "events"
            event_type = "Debates & Workshops"
        elif "podcast" in cap_lower or "let’s talk" in cap_lower or "lets talk" in cap_lower:
            category = "podcasts"
            event_type = "Let's Talk Podcast"
        elif "magisterium" in cap_lower or "odontologie légale" in cap_lower:
            category = "magisterium"
            event_type = "Magisterium (Archived)"
        elif "trophée" in cap_lower or "trophee" in cap_lower or "remise des" in cap_lower:
            category = "awards"
            event_type = "Awards & Ceremonies"
        else:
            category = "team"
            event_type = "Team & Fellowship"

        # Collect media URLs
        media_urls = []
        if media_type == 8 and "carousel_media" in item:
            for c_idx, c_item in enumerate(item["carousel_media"]):
                candidates = c_item.get("image_versions2", {}).get("candidates", [])
                if candidates:
                    media_urls.append({"index": c_idx + 1, "url": candidates[0]["url"]})
        else:
            candidates = item.get("image_versions2", {}).get("candidates", [])
            if candidates:
                media_urls.append({"index": 0, "url": candidates[0]["url"]})

        post_record = {
            "shortcode": shortcode,
            "url": f"https://www.instagram.com/p/{shortcode}/",
            "date": date_str,
            "likes": likes,
            "comments": comments,
            "category": category,
            "event_type": event_type,
            "caption": caption_text[:300],
            "media_count": len(media_urls)
        }
        posts_summary.append(post_record)
        
    summary_path = "instagram/metadata/posts_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(posts_summary, f, indent=2, ensure_ascii=False)
        
    print(f"[✓] Processed and categorized {len(posts_summary)} posts summary saved to {summary_path}")

if __name__ == "__main__":
    fetch_all_posts()
