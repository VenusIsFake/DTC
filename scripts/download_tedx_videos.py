import os
import json
import urllib.request

def download_tedx_videos():
    with open("instagram/metadata/all_posts_complete.json", "r", encoding="utf-8") as f:
        posts = json.load(f)

    tedx_speakers = [
        {"code": "DRsU8yIgBIp", "extract": 1, "speaker": "Yahia Chemsi", "topic": "Les réseaux sociaux, l'intelligence artificielle et l'humain", "video_filename": "tedx_01_yahia_chemsi.mp4", "poster_filename": "tedx_01_yahia_chemsi.jpg"},
        {"code": "DRusITjjZg2", "extract": 2, "speaker": "Aya Jei", "topic": "Brain rot", "video_filename": "tedx_02_aya_jei.mp4", "poster_filename": "tedx_02_aya_jei.jpg"},
        {"code": "DRvCNV4AA-V", "extract": 3, "speaker": "Inès Ben Salah", "topic": "L'intelligence émotionnelle", "video_filename": "tedx_03_ines_ben_salah.mp4", "poster_filename": "tedx_03_ines_ben_salah.jpg"},
        {"code": "DRxngHcgGSG", "extract": 4, "speaker": "Aya Talbi", "topic": "Zlayjiphobie : plaidoyer pour un patriotisme conscient", "video_filename": "tedx_04_aya_talbi.mp4", "poster_filename": "tedx_04_aya_talbi.jpg"},
        {"code": "DR2qD2mAMT8", "extract": 5, "speaker": "Baha Eddine Achaach", "topic": "Gen Z : the pulse of a changing Morocco", "video_filename": "tedx_05_baha_eddine_achaach.mp4", "poster_filename": "tedx_05_baha_eddine_achaach.jpg"},
        {"code": "DR5h9jODPEm", "extract": 6, "speaker": "Hiba Birouki", "topic": "The cost of being flawless", "video_filename": "tedx_06_hiba_birouki.mp4", "poster_filename": "tedx_06_hiba_birouki.jpg"},
        {"code": "DSAuStRjSR8", "extract": 7, "speaker": "George Pupwe", "topic": "Redefining efficiency, beyond the perfect image", "video_filename": "tedx_07_george_pupwe.mp4", "poster_filename": "tedx_07_george_pupwe.jpg"},
        {"code": "DSBI9mogErJ", "extract": 8, "speaker": "Fahd Rahim", "topic": "Purpose over pressure", "video_filename": "tedx_08_fahd_rahim.mp4", "poster_filename": "tedx_08_fahd_rahim.jpg"}
    ]

    post_map = {p.get("code"): p for p in posts}
    headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.instagram.com/"}
    out_dir = "instagram/events"
    os.makedirs(out_dir, exist_ok=True)

    print("[*] Downloading all 8 TEDxFMDC MP4 video reels...")
    updated_catalog = []

    for t in tedx_speakers:
        p = post_map.get(t["code"])
        if not p:
            print(f"[-] Post {t['code']} not found in archive")
            continue
            
        vids = p.get("video_versions", [])
        if not vids:
            print(f"[-] No video versions for {t['code']}")
            continue
            
        vid_url = vids[0]["url"]
        w = vids[0].get("width")
        h = vids[0].get("height")
        video_dest = os.path.join(out_dir, t["video_filename"])
        
        print(f"  Downloading [{t['extract']}/8] {t['speaker']} ({w}x{h} MP4)...")
        try:
            req = urllib.request.Request(vid_url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as resp:
                with open(video_dest, "wb") as fp:
                    fp.write(resp.read())
            size_mb = os.path.getsize(video_dest) / (1024 * 1024)
            print(f"  ✓ Saved {video_dest} ({size_mb:.2f} MB)")
            
            updated_catalog.append({
                "extract": t["extract"],
                "speaker": t["speaker"],
                "topic": t["topic"],
                "code": t["code"],
                "url": f"https://www.instagram.com/p/{t['code']}/",
                "video_file": f"instagram/events/{t['video_filename']}",
                "poster_file": f"instagram/events/{t['poster_filename']}",
                "resolution": f"{w}x{h}",
                "size_mb": round(size_mb, 2)
            })
        except Exception as e:
            print(f"  ✗ Error downloading {t['video_filename']}: {e}")

    with open("instagram/metadata/tedx_talks.json", "w", encoding="utf-8") as f:
        json.dump(updated_catalog, f, indent=2, ensure_ascii=False)
        
    print(f"\n[✓] All {len(updated_catalog)} TEDx video reels successfully saved and cataloged in instagram/metadata/tedx_talks.json!")

if __name__ == "__main__":
    download_tedx_videos()
