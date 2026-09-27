import os
import glob
import re
import json

ldb_dir = os.path.expanduser("~/.config/google-chrome/Default/IndexedDB/https_web.whatsapp.com_0.indexeddb.leveldb")
files = [os.path.join(ldb_dir, f) for f in os.listdir(ldb_dir) if f.endswith((".ldb", ".log"))]

# Load candidates and lids
candidates = json.load(open("/home/venus/Projects/DTC/broadcast_results.json"))
candidate_lids = json.load(open("/home/venus/Projects/DTC/candidate_lids.json"))

cand_by_phone = {}
cand_by_lid = {}
cand_by_jid = {}

for c in candidates:
    p = re.sub(r"\D", "", c["phone"])
    if p.startswith("0"):
        p = "212" + p[1:]
    cand_by_phone[p] = c
    c["clean_phone"] = p

for item in candidate_lids:
    jid = item["jid"]
    p = jid.split("@")[0]
    c = cand_by_phone.get(p)
    if c:
        cand_by_jid[jid] = c
        if item.get("lid"):
            lid_num = item["lid"].split("@")[0]
            cand_by_lid[lid_num] = c
            c["lid"] = item["lid"]

print(f"Loaded {len(candidates)} candidates.")
print(f"Mapped {len(cand_by_lid)} LIDs.")

# Results structure
results = {
    c["name"]: {
        "candidate": c,
        "replies": [],
        "read": False,
        "delivered": False,
        "last_ack": 0,
        "contexts": []
    }
    for c in candidates
}

# Also load existing replies from dm_replies.json
if os.path.exists("/home/venus/Projects/DTC/dm_replies.json"):
    dm_reps = json.load(open("/home/venus/Projects/DTC/dm_replies.json"))
    for rep in dm_reps:
        from_jid = rep.get("from")
        # Match by lid
        cand = None
        if from_jid:
            lid_prefix = from_jid.split("@")[0]
            cand = cand_by_lid.get(lid_prefix)
        if cand:
            results[cand["name"]]["read"] = True
            if rep.get("text") and rep["text"] not in results[cand["name"]]["replies"]:
                results[cand["name"]]["replies"].append(rep["text"])

# Scan Chrome leveldb
for f in files:
    try:
        with open(f, "rb") as fp:
            data = fp.read()
    except Exception:
        continue

    # Search for LIDs
    for lid_num, c in cand_by_lid.items():
        b_lid = lid_num.encode()
        if b_lid not in data:
            continue

        for m in re.finditer(b_lid, data):
            start = max(0, m.start() - 350)
            end = min(len(data), m.end() + 350)
            chunk = data[start:end]

            # Detect read/delivered flags in binary protobufs & JSON metadata
            if b"readN" in chunk or b'"read":true' in chunk or b"ackI\x03" in chunk or b'"ack":3' in chunk:
                results[c["name"]]["read"] = True
                results[c["name"]]["last_ack"] = max(results[c["name"]]["last_ack"], 3)
            elif b"deliveryN" in chunk or b'"delivery"' in chunk or b"ackI\x02" in chunk or b'"ack":2' in chunk:
                results[c["name"]]["delivered"] = True
                results[c["name"]]["last_ack"] = max(results[c["name"]]["last_ack"], 2)
            elif b"ackI\x01" in chunk or b'"ack":1' in chunk:
                results[c["name"]]["last_ack"] = max(results[c["name"]]["last_ack"], 1)

            # Extract potential reply bodies
            for b_m in re.finditer(rb'body"[:\s]+"([^"\\]{1,300})"', chunk):
                try:
                    text = b_m.group(1).decode("utf-8", errors="ignore").strip()
                    # Filter out outbound broadcast templates
                    if text.startswith("Bonjour") or text.startswith("Super") or text.startswith("Coucou"):
                        continue
                    if text and text not in results[c["name"]]["replies"]:
                        results[c["name"]]["replies"].append(text)
                except Exception:
                    pass

    # Search for phone numbers directly
    for p, c in cand_by_phone.items():
        b_p = p.encode()
        if b_p not in data:
            continue

        for m in re.finditer(b_p, data):
            start = max(0, m.start() - 350)
            end = min(len(data), m.end() + 350)
            chunk = data[start:end]

            if b"readN" in chunk or b'"read":true' in chunk or b"ackI\x03" in chunk or b'"ack":3' in chunk:
                results[c["name"]]["read"] = True
                results[c["name"]]["last_ack"] = max(results[c["name"]]["last_ack"], 3)
            elif b"deliveryN" in chunk or b'"delivery"' in chunk or b"ackI\x02" in chunk or b'"ack":2' in chunk:
                results[c["name"]]["delivered"] = True
                results[c["name"]]["last_ack"] = max(results[c["name"]]["last_ack"], 2)

            for b_m in re.finditer(rb'body"[:\s]+"([^"\\]{1,300})"', chunk):
                try:
                    text = b_m.group(1).decode("utf-8", errors="ignore").strip()
                    if text.startswith("Bonjour") or text.startswith("Super") or text.startswith("Coucou"):
                        continue
                    if text and text not in results[c["name"]]["replies"]:
                        results[c["name"]]["replies"].append(text)
                except Exception:
                    pass

# Save full analysis
out_data = []
for name, r in sorted(results.items()):
    c = r["candidate"]
    out_data.append({
        "name": name,
        "phone": c["phone"],
        "lid": c.get("lid"),
        "read": r["read"],
        "delivered": r["delivered"],
        "last_ack": r["last_ack"],
        "replies": r["replies"]
    })

with open("/home/venus/Projects/DTC/broadcast_detailed_analysis.json", "w", encoding="utf-8") as fp:
    json.dump(out_data, fp, indent=2, ensure_ascii=False)

print(f"\nSaved analysis for {len(out_data)} candidates to broadcast_detailed_analysis.json")
