import urllib.request
import re
import json
import os

def extract_from_embed():
    url = "https://www.instagram.com/dentalkclub_fmdc/embed/"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        html = r.read().decode("utf-8", errors="ignore")

    # Find the PolarisEmbedProfile data
    pattern = r'(\{"context":\{"username":"dentalkclub_fmdc".*?\}\})\s*"\s*,\s*"\s*owner_id'
    
    # Alternatively find all JSON chunks containing username and posts
    # Let's search with regex for "contextJSON":"...
    idx = html.find('"contextJSON":"')
    if idx == -1:
        print("contextJSON not found")
        return
    
    start_pos = idx + len('"contextJSON":"')
    # Extract string up to the unescaped quote
    end_pos = start_pos
    while end_pos < len(html):
        if html[end_pos] == '"' and html[end_pos-1] != '\\':
            break
        end_pos += 1
        
    raw_json_str = html[start_pos:end_pos]
    print(f"Extracted json string length: {len(raw_json_str)}")
    
    # decode JSON-escaped string by wrapping it in JSON string parser
    decoded_str = json.loads('"' + raw_json_str + '"')
    
    # Now parse the inner JSON
    data = json.loads(decoded_str)
    
    os.makedirs("data/instagram/raw", exist_ok=True)
    with open("data/instagram/raw/embed_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print("[+] Successfully saved embed_data.json!")
    return data

if __name__ == "__main__":
    extract_from_embed()
