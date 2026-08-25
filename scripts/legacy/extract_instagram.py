import os
import json
import time
from datetime import datetime
import instaloader

def scrape_dentalkclub():
    target_profile = "dentalkclub_fmdc"
    output_dir = os.path.abspath("data/instagram/raw")
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"[*] Initializing Instaloader for @{target_profile}...")
    L = instaloader.Instaloader(
        download_pictures=True,
        download_videos=True,
        download_video_thumbnails=True,
        download_geotags=False,
        download_comments=False,
        save_metadata=True,
        dirname_pattern=output_dir,
        filename_pattern="{date_utc:%Y-%m-%d_%H-%M-%S}_{shortcode}"
    )

    posts_data = []
    
    try:
        profile = instaloader.Profile.from_username(L.context, target_profile)
        print(f"[+] Profile found: {profile.full_name} (@{profile.username})")
        print(f"[+] Biography: {profile.biography}")
        print(f"[+] Total Posts: {profile.mediacount}, Followers: {profile.followers}, Following: {profile.followees}")

        profile_metadata = {
            "username": profile.username,
            "full_name": profile.full_name,
            "biography": profile.biography,
            "profile_pic_url": profile.profile_pic_url,
            "followers": profile.followers,
            "followees": profile.followees,
            "total_posts": profile.mediacount,
            "is_verified": profile.is_verified,
            "is_private": profile.is_private,
            "external_url": profile.external_url,
            "scraped_at": datetime.utcnow().isoformat() + "Z"
        }
        
        with open(os.path.join(output_dir, "profile_metadata.json"), "w", encoding="utf-8") as f:
            json.dump(profile_metadata, f, indent=2, ensure_ascii=False)
            
        print("[*] Starting post downloads and extraction...")
        count = 0
        for post in profile.get_posts():
            count += 1
            print(f"[{count}/{profile.mediacount}] Processing post: {post.shortcode} ({post.date_utc.strftime('%Y-%m-%d')})")
            
            try:
                L.download_post(post, target=target_profile)
            except Exception as dl_err:
                print(f"[!] Warning: error downloading media for {post.shortcode}: {dl_err}")

            post_info = {
                "shortcode": post.shortcode,
                "url": f"https://www.instagram.com/p/{post.shortcode}/",
                "date_utc": post.date_utc.isoformat() + "Z",
                "caption": post.caption or "",
                "likes": post.likes,
                "comments": post.comments,
                "is_video": post.is_video,
                "video_url": post.video_url if post.is_video else None,
                "typename": post.typename,
                "caption_hashtags": list(post.caption_hashtags),
                "tagged_users": list(post.tagged_users)
            }
            posts_data.append(post_info)
            time.sleep(1.5) # Polite pause

        with open(os.path.join(output_dir, "all_posts_extracted.json"), "w", encoding="utf-8") as f:
            json.dump(posts_data, f, indent=2, ensure_ascii=False)
            
        print(f"[✓] Successfully extracted {len(posts_data)} posts for @{target_profile}!")

    except Exception as e:
        print(f"[!] Error during extraction: {e}")
        if posts_data:
            with open(os.path.join(output_dir, "all_posts_extracted_partial.json"), "w", encoding="utf-8") as f:
                json.dump(posts_data, f, indent=2, ensure_ascii=False)
        raise e

if __name__ == "__main__":
    scrape_dentalkclub()
