import os
from PIL import Image, ImageDraw

def extract_logo():
    src_path = "instagram/metadata/original_DBMRjqrAGlM.jpg"
    im = Image.open(src_path).convert("RGBA")
    
    # The logo circle in DBMRjqrAGlM is centered around (530, 440) with diameter ~700 px
    # Let's precisely find and crop the circle
    # Size of original is 1080x1080
    w, h = im.size
    print(f"Original size: {w}x{h}")
    
    # Circle bounds:
    # Top edge ~ 88, Bottom edge ~ 836, Left edge ~ 180, Right edge ~ 928
    # Center = (554, 462), Radius = 374
    cx, cy = 535, 440
    r = 355
    
    # Crop square
    crop_box = (cx - r, cy - r, cx + r, cy + r)
    cropped = im.crop(crop_box)
    
    # Create circular mask for clean edges
    mask = Image.new("L", (r*2, r*2), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, r*2, r*2), fill=255)
    
    # Apply mask
    transparent_logo = Image.new("RGBA", (r*2, r*2), (0, 0, 0, 0))
    transparent_logo.paste(cropped, (0, 0), mask=mask)
    
    # Save original logo in high quality PNG
    dest_png = "instagram/metadata/dtc_logo.png"
    transparent_logo.save(dest_png, "PNG")
    print(f"[✓] Successfully saved authentic original DTC logo to {dest_png} ({transparent_logo.size[0]}x{transparent_logo.size[1]})")
    
    # Also save standard circular badge
    dest_badge = "instagram/metadata/dtc_badge_original.png"
    transparent_logo.save(dest_badge, "PNG")

    # Remove the custom SVG if present
    if os.path.exists("instagram/metadata/dtc_logo.svg"):
        os.remove("instagram/metadata/dtc_logo.svg")
        print("[✓] Removed custom redrawn SVG in favor of authentic original logo.")

if __name__ == "__main__":
    extract_logo()
