import os
import glob
import re
import json

ldb_dir = os.path.expanduser("~/.config/google-chrome/Default/IndexedDB/https_web.whatsapp.com_0.indexeddb.leveldb")
files = [os.path.join(ldb_dir, f) for f in os.listdir(ldb_dir) if f.endswith((".ldb", ".log"))]
# Sort by mtime descending, take files modified since yesterday
recent_files = [f for f in sorted(files, key=os.path.getmtime, reverse=True) if os.path.getmtime(f) > 1790280000]

print(f"Found {len(recent_files)} files modified since yesterday.")

# Also load existing replies
existing_replies = []
if os.path.exists("/home/venus/Projects/DTC/dm_replies.json"):
    existing_replies = json.load(open("/home/venus/Projects/DTC/dm_replies.json"))

known_reply_texts = set(r.get("text", "").strip() for r in existing_replies if r.get("text"))

extracted_snippets = []

keywords = ["chaud", "aventure", "dentalk", "merci", "interess", "intéress", "rejoindre", "garder une place", "bnsr", "salam", "bonjour", "salut", "toujours", "confirme"]

for f in recent_files:
    try:
        with open(f, "rb") as fp:
            raw = fp.read()
    except Exception as e:
        continue

    # Look for "body" fields in json/msg representations
    for m in re.finditer(rb'body"[:\s]+"([^"\\]{4,300})"', raw):
        try:
            txt = m.group(1).decode("utf-8", errors="ignore").strip()
            start = max(0, m.start() - 250)
            end = min(len(raw), m.end() + 250)
            ctx = raw[start:end]
            extracted_snippets.append((os.path.basename(f), txt, ctx))
        except Exception:
            pass

    # Decode entire file as utf-8 (ignore errors) and search text
    decoded = raw.decode("utf-8", errors="ignore")
    for line in re.finditer(r'([A-Za-z0-9\s,\.éèêëàâôûùçîï\'!?-]{12,250})', decoded):
        txt = line.group(1).strip()
        lower = txt.lower()
        if any(k in lower for k in keywords):
            start = max(0, line.start() - 200)
            end = min(len(decoded), line.end() + 200)
            ctx = decoded[start:end].encode("utf-8")
            extracted_snippets.append((os.path.basename(f), txt, ctx))

print(f"Total snippets gathered: {len(extracted_snippets)}")

seen = set()
unique = []
for f, txt, ctx in extracted_snippets:
    cleaned = " ".join(txt.split())
    if len(cleaned) < 8:
        continue
    # Filter out outbound templates
    if "C'est la rentr" in cleaned and "Dentalk Club" in cleaned:
        continue
    if "Super" in cleaned and "Tu fais officiellement partie" in cleaned:
        continue
    if "Félicitations pour ton admission à la Faculté" in cleaned:
        continue
    if "Dis-nous juste par message pour qu'on te garde une place" in cleaned:
        continue
    if cleaned not in seen:
        seen.add(cleaned)
        phones_in_ctx = re.findall(rb'212\d{9}', ctx)
        lids_in_ctx = re.findall(rb'\d{12,18}@lid', ctx)
        pushnames_in_ctx = re.findall(rb'pushname"[:\s]+"([^"]+)"', ctx)
        unique.append({
            "file": f,
            "text": cleaned,
            "phones": list(set([p.decode() for p in phones_in_ctx])),
            "lids": list(set([l.decode() for l in lids_in_ctx])),
            "pushnames": list(set([pn.decode("utf-8", errors="ignore") for pn in pushnames_in_ctx])),
            "is_known_reply": cleaned in known_reply_texts
        })

print(f"Unique message candidates: {len(unique)}")
with open("/home/venus/Projects/DTC/extracted_chat_snippets.json", "w") as out:
    json.dump(unique, out, indent=2, ensure_ascii=False)

for u in unique:
    prefix = "[ALREADY RECORDED]" if u["is_known_reply"] else ">>> [NEW/POTENTIAL]"
    print(f"{prefix} text: \"{u['text']}\" | phones: {u['phones']} | lids: {u['lids']} | names: {u['pushnames']}")
