import json
import re

data = json.load(open("/home/venus/Projects/DTC/broadcast_detailed_analysis.json"))

accepted = []
rejected = []
seen_no_reply = []
unseen = []
questions = []

q_keywords = ["?", "comment", "combien", "quand", "quoi", "prix", "cotisation", "ou", "où"]

for item in data:
    name = item["name"]
    phone = item["phone"]
    replies = item["replies"]
    read = item["read"]

    # Check if rejected
    is_rejected = any("ne pourrai pas" in r.lower() or "pas cette année" in r.lower() or "ne peux pas" in r.lower() for r in replies)
    if is_rejected:
        rejected.append(item)
        continue

    # Check if questions (use exact word matching or question mark)
    has_question = "?" in " ".join(replies) or any(
        re.search(r"\b(comment|combien|quand|quoi|prix|cotisation)\b", r, re.IGNORECASE) for r in replies
    )
    if has_question:
        questions.append(item)
        continue

    # Check if positively replied
    is_positive = any(any(w in r.lower() for w in ["oui", "intéress", "interess", "confirme", "chaimae", "sara", "saluuu", "wajda"]) for r in replies)
    # Sara Iguimer confirmed in previous session
    if is_positive or name == "Sara Iguimer":
        accepted.append(item)
    elif read:
        seen_no_reply.append(item)
    else:
        unseen.append(item)

print(f"=== CLASSIFICATION SUMMARY (Total: {len(data)}) ===")

print(f"\n🟢 1. Accepted / Replied Positively ({len(accepted)}):")
for a in accepted:
    print(f"   • {a['name']} ({a['phone']}) -> {a['replies']}")

print(f"\n🔴 2. Rejected ({len(rejected)}):")
for r in rejected:
    print(f"   • {r['name']} ({r['phone']}) -> {r['replies']}")

print(f"\n❓ 3. Questions Asked ({len(questions)}):")
for q in questions:
    print(f"   • {q['name']} ({q['phone']}) -> {q['replies']}")

print(f"\n👀 4. Ignored - SEEN (Read message, did NOT reply) ({len(seen_no_reply)}):")
for s in seen_no_reply:
    print(f"   • {s['name']} ({s['phone']}) [ack={s['last_ack']}]")

print(f"\n📦 5. Ignored - UNSEEN (Did NOT see message at all -> To Add to Group) ({len(unseen)}):")
for u in unseen:
    print(f"   • {u['name']} ({u['phone']}) [delivered={u['delivered']}, ack={u['last_ack']}]")

# Save classified output
output_bundle = {
    "total": len(data),
    "accepted": accepted,
    "rejected": rejected,
    "questions": questions,
    "seen_no_reply": seen_no_reply,
    "unseen_to_add_to_group": unseen
}

with open("/home/venus/Projects/DTC/candidates_classified.json", "w", encoding="utf-8") as fp:
    json.dump(output_bundle, fp, indent=2, ensure_ascii=False)

print("\nSaved output to /home/venus/Projects/DTC/candidates_classified.json")
