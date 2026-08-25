import os
from PIL import Image

def generate_favicons():
    src_path = "instagram/metadata/dtc_logo.png"
    im = Image.open(src_path).convert("RGBA")
    
    # 1. public/favicon.png (32x32)
    fav32 = im.resize((32, 32), Image.Resampling.LANCZOS)
    fav32.save("public/favicon.png", "PNG")
    
    # 2. public/favicon.ico (Multi-resolution: 16, 32, 48)
    fav16 = im.resize((16, 16), Image.Resampling.LANCZOS)
    fav48 = im.resize((48, 48), Image.Resampling.LANCZOS)
    im.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    im.save("src/app/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    # 3. Apple Touch Icon (180x180)
    apple180 = im.resize((180, 180), Image.Resampling.LANCZOS)
    apple180.save("public/apple-touch-icon.png", "PNG")
    apple180.save("src/app/apple-icon.png", "PNG")
    
    # 4. Next.js App Router dynamic icon (512x512)
    icon512 = im.resize((512, 512), Image.Resampling.LANCZOS)
    icon512.save("src/app/icon.png", "PNG")
    icon512.save("public/icon-512.png", "PNG")
    
    print("[✓] Generated all authentic DTC favicons, apple touch icons, and Next.js app icons!")

if __name__ == "__main__":
    generate_favicons()
