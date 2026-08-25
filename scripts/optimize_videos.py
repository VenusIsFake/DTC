import subprocess
import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

EVENTS_DIR = Path("public/media/events")
TMP_DIR = Path("/tmp/opt_events")
TMP_DIR.mkdir(parents=True, exist_ok=True)

videos = list(EVENTS_DIR.glob("tedx_*.mp4"))

def optimize_video(video_path):
    out_path = TMP_DIR / video_path.name
    print(f"Optimizing {video_path.name}...")
    cmd = [
        "ffmpeg", "-y",
        "-i", str(video_path),
        "-vf", "scale=480:-2",
        "-c:v", "libx264",
        "-crf", "32",
        "-preset", "faster",
        "-c:a", "aac",
        "-b:a", "64k",
        "-movflags", "+faststart",
        str(out_path)
    ]
    res = subprocess.run(cmd, capture_output=True)
    if res.returncode == 0:
        orig_size = video_path.stat().st_size / (1024 * 1024)
        new_size = out_path.stat().st_size / (1024 * 1024)
        print(f"✅ {video_path.name}: {orig_size:.1f} MB -> {new_size:.1f} MB")
        out_path.replace(video_path)
    else:
        print(f"❌ Failed {video_path.name}: {res.stderr.decode()[:200]}")

with ThreadPoolExecutor(max_workers=4) as executor:
    executor.map(optimize_video, videos)

print("All video reels optimized successfully!")
