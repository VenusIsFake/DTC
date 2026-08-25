import os
import shutil

def setup_public():
    os.makedirs("public", exist_ok=True)
    os.makedirs("public/media", exist_ok=True)
    
    # 1. Logo
    shutil.copy2("instagram/metadata/dtc_logo.png", "public/logo.png")
    shutil.copy2("instagram/metadata/dtc_logo.png", "public/favicon.png")
    print("[✓] Copied authentic logo to public/logo.png")

    # 2. Copy folders: events, podcasts, team, awards
    for category in ["events", "podcasts", "team", "awards"]:
        src_cat = os.path.join("instagram", category)
        dst_cat = os.path.join("public/media", category)
        if os.path.exists(src_cat):
            if os.path.exists(dst_cat):
                shutil.rmtree(dst_cat)
            shutil.copytree(src_cat, dst_cat)
            print(f"[✓] Copied {category} ({len(os.listdir(dst_cat))} files) to public/media/{category}")

if __name__ == "__main__":
    setup_public()
