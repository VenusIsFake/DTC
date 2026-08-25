import os
import json
import urllib.request
from PIL import Image

def download_and_structure_all():
    with open("instagram/metadata/all_posts_complete.json", "r", encoding="utf-8") as f:
        posts = json.load(f)

    # 1. Structure TEDx Talks
    tedx_speakers = [
        {"code": "DRsU8yIgBIp", "extract": 1, "speaker": "Yahia Chemsi", "topic": "Les réseaux sociaux, l'intelligence artificielle et l'humain", "filename": "tedx_01_yahia_chemsi.jpg"},
        {"code": "DRusITjjZg2", "extract": 2, "speaker": "Aya Jei", "topic": "Brain rot", "filename": "tedx_02_aya_jei.jpg"},
        {"code": "DRvCNV4AA-V", "extract": 3, "speaker": "Inès Ben Salah", "topic": "L'intelligence émotionnelle", "filename": "tedx_03_ines_ben_salah.jpg"},
        {"code": "DRxngHcgGSG", "extract": 4, "speaker": "Aya Talbi", "topic": "Zlayjiphobie : plaidoyer pour un patriotisme conscient", "filename": "tedx_04_aya_talbi.jpg"},
        {"code": "DR2qD2mAMT8", "extract": 5, "speaker": "Baha Eddine Achaach", "topic": "Gen Z : the pulse of a changing Morocco", "filename": "tedx_05_baha_eddine_achaach.jpg"},
        {"code": "DR5h9jODPEm", "extract": 6, "speaker": "Hiba Birouki", "topic": "The cost of being flawless", "filename": "tedx_06_hiba_birouki.jpg"},
        {"code": "DSAuStRjSR8", "extract": 7, "speaker": "George Pupwe", "topic": "Redefining efficiency, beyond the perfect image", "filename": "tedx_07_george_pupwe.jpg"},
        {"code": "DSBI9mogErJ", "extract": 8, "speaker": "Fahd Rahim", "topic": "Purpose over pressure", "filename": "tedx_08_fahd_rahim.jpg"}
    ]

    post_map = {p.get("code"): p for p in posts}
    headers = {"User-Agent": "Mozilla/5.0", "Referer": "https://www.instagram.com/"}

    print("[*] Downloading TEDx 8-speaker talk thumbnails...")
    for t in tedx_speakers:
        dest = os.path.join("instagram/events", t["filename"])
        item = post_map.get(t["code"])
        if item:
            candidates = item.get("image_versions2", {}).get("candidates", [])
            if candidates:
                img_url = candidates[0]["url"]
                try:
                    req = urllib.request.Request(img_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        with open(dest, "wb") as fp:
                            fp.write(resp.read())
                    print(f"  ✓ Saved TEDx {t['extract']}/8: {t['filename']} ({t['speaker']})")
                except Exception as e:
                    print(f"  ✗ Error downloading {t['filename']}: {e}")

    # 2. Structure Podcast Episodes
    podcasts_data = [
        {"code": "DXAEliYDW5w", "episode": 4, "guest": "Pr. Sidi Mohamed Bouzoubaa", "filename": "podcast_ep4_prof_bouzoubaa.jpg"},
        {"code": "DQuninFDbRe", "episode": 3, "guest": "Pr. Haitam", "filename": "podcast_ep3_prof_haitam.jpg"},
        {"code": "DHME0jbsZEw", "episode": 1, "guest": "Launch Episode (DTC x CSD)", "filename": "podcast_ep1_launch.jpg"}
    ]

    print("\n[*] Downloading Podcast episode artworks...")
    for pod in podcasts_data:
        dest = os.path.join("instagram/podcasts", pod["filename"])
        item = post_map.get(pod["code"])
        if item:
            candidates = item.get("image_versions2", {}).get("candidates", [])
            if candidates:
                img_url = candidates[0]["url"]
                try:
                    req = urllib.request.Request(img_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=15) as resp:
                        with open(dest, "wb") as fp:
                            fp.write(resp.read())
                    print(f"  ✓ Saved Podcast Ep. {pod['episode']}: {pod['filename']}")
                except Exception as e:
                    print(f"  ✗ Error downloading {pod['filename']}: {e}")

    # 3. Save structured JSON files
    with open("instagram/metadata/tedx_talks.json", "w", encoding="utf-8") as f:
        json.dump(tedx_speakers, f, indent=2, ensure_ascii=False)
        
    with open("instagram/metadata/podcasts_catalog.json", "w", encoding="utf-8") as f:
        json.dump(podcasts_data, f, indent=2, ensure_ascii=False)

    print("\n[✓] Structured JSON catalogs saved to instagram/metadata/tedx_talks.json and podcasts_catalog.json!")

if __name__ == "__main__":
    download_and_structure_all()
