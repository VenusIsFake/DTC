import json
import urllib.request
import re
from datetime import datetime, timezone

# 1. Read .env.local
env = {}
with open(".env.local") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")

url = env["NEXT_PUBLIC_SUPABASE_URL"]
key = env["SUPABASE_SERVICE_ROLE_KEY"]

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def norm(p):
    if not p: return ""
    c = re.sub(r"\D", "", str(p))
    if c.startswith("0") and len(c) == 10:
        c = "212" + c[1:]
    elif len(c) == 9 and c.startswith(("6", "7")):
        c = "212" + c
    return c

# 2. Fetch current profiles
req = urllib.request.Request(f"{url}/rest/v1/profiles?select=*", headers=headers)
with urllib.request.urlopen(req) as resp:
    profiles = json.loads(resp.read().decode())

print(f"Total profiles fetched: {len(profiles)}")

# 3. Process approvals & payment statuses
now_iso = datetime.now(timezone.utc).isoformat()
ledger = {}
approved_count = 0
paid_count = 0
unpaid_count = 0
results = []

for p in profiles:
    pid = p["id"]
    name = p.get("full_name") or "(sans nom)"
    email = p.get("email") or ""
    phone = p.get("phone") or ""
    current_role = p.get("role")
    current_status = p.get("membership_status")
    p_norm = norm(phone)
    
    # Check special numbers
    is_4576 = p_norm.endswith("4576")
    is_0962 = p_norm.endswith("0962")
    
    if current_role in ("admin", "bureau"):
        continue  # Do not touch bureau or admin roles
        
    if is_4576 or is_0962:
        # Mark as APPROVED and PAID
        fee_paid = True
        bio_text = "Cotisation : Payée (80 DH - Ancien Membre)"
        patch_body = {
            "role": "member",
            "membership_status": "member",
            "bio": bio_text
        }
        req_patch = urllib.request.Request(
            f"{url}/rest/v1/profiles?id=eq.{pid}",
            data=json.dumps(patch_body).encode(),
            headers=headers,
            method="PATCH"
        )
        with urllib.request.urlopen(req_patch) as resp_p:
            updated = json.loads(resp_p.read().decode())
        
        paid_count += 1
        ledger[phone or pid] = {
            "profile_id": pid,
            "full_name": name,
            "email": email,
            "phone": phone,
            "role": "member",
            "fee_paid": True,
            "fee_amount": 80,
            "updated_at": now_iso
        }
        results.append({
            "name": name,
            "phone": phone,
            "email": email,
            "action": "APPROVED + PAID (Special)",
            "details": f"Role: member | Status: member | Bio: {bio_text}"
        })
    elif current_role == "guest":
        # Guest to be approved, but marked UNPAID
        fee_paid = False
        bio_text = "Cotisation : Non payée (En attente)"
        patch_body = {
            "role": "member",
            "membership_status": "member",
            "bio": bio_text
        }
        req_patch = urllib.request.Request(
            f"{url}/rest/v1/profiles?id=eq.{pid}",
            data=json.dumps(patch_body).encode(),
            headers=headers,
            method="PATCH"
        )
        with urllib.request.urlopen(req_patch) as resp_p:
            updated = json.loads(resp_p.read().decode())
        
        approved_count += 1
        unpaid_count += 1
        ledger[phone or pid] = {
            "profile_id": pid,
            "full_name": name,
            "email": email,
            "phone": phone,
            "role": "member",
            "fee_paid": False,
            "fee_amount": 100,
            "updated_at": now_iso
        }
        results.append({
            "name": name,
            "phone": phone,
            "email": email,
            "action": "APPROVED (Unpaid)",
            "details": f"Role: member | Status: member | Bio: {bio_text}"
        })
    elif current_role == "member":
        # Already member (e.g., Trend)
        bio_text = p.get("bio") or "Cotisation : Non payée (En attente)"
        patch_body = {
            "membership_status": "member",
            "bio": bio_text
        }
        req_patch = urllib.request.Request(
            f"{url}/rest/v1/profiles?id=eq.{pid}",
            data=json.dumps(patch_body).encode(),
            headers=headers,
            method="PATCH"
        )
        with urllib.request.urlopen(req_patch) as resp_p:
            updated = json.loads(resp_p.read().decode())
        
        unpaid_count += 1
        ledger[phone or pid] = {
            "profile_id": pid,
            "full_name": name,
            "email": email,
            "phone": phone,
            "role": "member",
            "fee_paid": False,
            "fee_amount": 100,
            "updated_at": now_iso
        }
        results.append({
            "name": name,
            "phone": phone,
            "email": email,
            "action": "MAINTAINED (Unpaid member)",
            "details": f"Role: member | Status: member"
        })

# 4. Upsert ledger into site_settings
upsert_setting_body = {
    "key": "membership_fees_ledger",
    "value": ledger
}
req_setting = urllib.request.Request(
    f"{url}/rest/v1/site_settings",
    data=json.dumps(upsert_setting_body).encode(),
    headers={**headers, "Prefer": "resolution=merge-duplicates"},
    method="POST"
)
try:
    with urllib.request.urlopen(req_setting) as resp_s:
        print("Updated site_settings.membership_fees_ledger successfully.")
except Exception as e:
    print("Warning updating site_settings:", e)

# 5. Save audit log locally
audit_output = {
    "timestamp": now_iso,
    "summary": {
        "total_processed": len(results),
        "total_approved_from_guest": approved_count,
        "total_marked_paid": paid_count,
        "total_marked_unpaid": unpaid_count
    },
    "results": results
}

with open("membership_approval_results.json", "w") as out:
    json.dump(audit_output, out, indent=2)

print("\n=== EXECUTION COMPLETE ===")
print(f"Total processed: {len(results)}")
print(f"Newly Approved: {approved_count}")
print(f"Marked Paid (4576 & 0962): {paid_count}")
print(f"Marked Unpaid: {unpaid_count}")
print("\nDetails:")
for r in results:
    print(f"[{r['action']}] {r['name']:25} | {r['phone']:15} | {r['email']}")
