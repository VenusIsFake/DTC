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

with open("supabase_profiles_dump.json") as f:
    profiles = json.load(f)

with open("group_26_27_participants.json") as f:
    g26 = json.load(f)
g26_phones = {norm(x["phone"]) for x in g26 if norm(x["phone"])}

with open("candidates_classified.json") as f:
    classified = json.load(f)
conf_phones = {norm(x["phone"]) for x in classified.get("confirmed", [])}

with open("contacts_dtc.vcf") as f:
    vcf_phones = set()
    for line in f:
        if line.startswith("TEL"):
            vcf_phones.add(norm(line.split(":")[-1]))

guests = [p for p in profiles if p.get("role") == "guest"]
members = [p for p in profiles if p.get("role") == "member"]

print(f"Total guests on website: {len(guests)}")
print(f"Total members on website: {len(members)}")

print("\n--- GUEST ACCOUNTS DETAIL ---")
for g in guests:
    p_norm = norm(g.get("phone", ""))
    in_g26 = p_norm in g26_phones
    in_conf = p_norm in conf_phones
    in_vcf = p_norm in vcf_phones
    is_4576 = p_norm.endswith("4576")
    is_0962 = p_norm.endswith("0962")
    
    gid = g["id"]
    name = g["full_name"]
    phone = g["phone"]
    email = g["email"]
    print(f"ID: {gid}")
    print(f"Name: {name} | Phone: {phone} | Email: {email}")
    print(f"In G26: {in_g26} | In Confirmed: {in_conf} | In DTC Contacts: {in_vcf} | 4576: {is_4576} | 0962: {is_0962}")
    print("-" * 50)
