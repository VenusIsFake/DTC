import json
import urllib.request

env = {}
with open(".env.local") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip("\"'")

url = env["NEXT_PUBLIC_SUPABASE_URL"]
key = env["SUPABASE_SERVICE_ROLE_KEY"]

req = urllib.request.Request(
    f"{url}/rest/v1/profiles?select=*",
    headers={"apikey": key, "Authorization": f"Bearer {key}"}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())

print(f"Total profiles: {len(data)}")
if data:
    print("Columns:", list(data[0].keys()))
    print("--- PROFILES LIST ---")
    for p in data:
        print(f"ID: {p.get('id')} | Name: {p.get('full_name')} | Phone: {p.get('phone')} | Role: {p.get('role')} | Status: {p.get('membership_status')} | Email: {p.get('email')}")

with open("supabase_profiles_dump.json", "w") as out:
    json.dump(data, out, indent=2)
