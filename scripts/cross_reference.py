import json
import re

def norm(p):
    if not p: return ""
    c = re.sub(r"\D", "", p)
    if c.startswith("0") and len(c) == 10:
        c = "212" + c[1:]
    elif len(c) == 9 and c.startswith(("6", "7")):
        c = "212" + c
    return c

# 1. Profiles
with open("supabase_profiles_dump.json") as f:
    profiles = json.load(f)

# 2. Group 26/27 participants
with open("group_26_27_participants.json") as f:
    g26 = json.load(f)

g26_phones = {norm(x["phone"]) for x in g26 if norm(x["phone"])}

# 3. Candidates roster (classified)
with open("candidates_classified.json") as f:
    classified = json.load(f)

confirmed_phones = {norm(c["phone"]) for c in classified.get("confirmed", [])}

# 4. Accepted members csv / vcf
with open("anciens_recipients.json") as f:
    anciens = json.load(f)
anciens_phones = {norm(x["phone"]) for x in anciens if norm(x["phone"])}

print(f"Total profiles in Supabase: {len(profiles)}")
print(f"Group 26/27 unique phones: {len(g26_phones)}")
print(f"Classified confirmed phones: {len(confirmed_phones)}")
print(f"Anciens recipients phones: {len(anciens_phones)}")

print("\n=== CROSS-REFERENCING ALL PROFILES ===")
for p in profiles:
    phone_raw = p.get("phone") or ""
    p_norm = norm(phone_raw)
    name = p.get("full_name") or ""
    role = p.get("role")
    status = p.get("membership_status")
    email = p.get("email")
    pid = p.get("id")

    in_g26 = p_norm in g26_phones
    in_conf = p_norm in confirmed_phones
    in_anc = p_norm in anciens_phones
    is_4576 = p_norm.endswith("4576")
    is_0962 = p_norm.endswith("0962")

    flags = []
    if in_g26: flags.append("G26_27")
    if in_conf: flags.append("CONFIRMED")
    if in_anc: flags.append("ANCIEN")
    if is_4576: flags.append("SPECIAL_4576")
    if is_0962: flags.append("SPECIAL_0962")

    flag_str = "+".join(flags) if flags else "NOT_IN_GROUPS"
    print(f"{name:25} | {phone_raw:15} | {role:7} | {status:8} | {flag_str}")
