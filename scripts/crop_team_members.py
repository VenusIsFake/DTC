import os
import json
from PIL import Image

def crop_team_members():
    src_path = "instagram/team/bureau_executif_2025_2026.jpg"
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return
        
    im = Image.open(src_path)
    w, h = im.size # 1440 x 1440
    print(f"Loaded image size: {w}x{h}")
    
    # Team members with their center coordinates (approx % of 1440x1440) and crop box
    # 1. Hatim El Guerraoui (President) - center ~ (720, 275)
    # 2. El Khabbouli Saad (VP) - center ~ (295, 555)
    # 3. Saber Maryam (VP) - center ~ (950, 555)
    # 4. Jei Aya (Secrétaire Générale) - center ~ (195, 765)
    # 5. Abla Douaae (Chef de Projet) - center ~ (620, 765)
    # 6. Ettallab Elhoussein (Trésorier) - center ~ (1060, 765)
    # 7. Essaghir Anas (Directeur Artistique) - center ~ (195, 975)
    # 8. El Kinani Yassir (Respo Media) - center ~ (620, 975)
    # 9. Mrabet Zyad (Respo Logistique) - center ~ (1060, 975)
    # 10. Jawadi Salwa (Respo sec ANG) - center ~ (195, 1195)
    # 11. Rouadha Ihssane (Respo sec FR) - center ~ (620, 1195)
    # 12. Ouagague Hafsa (Respo sec AR) - center ~ (1060, 1195)

    members = [
        {"name": "Hatim El Guerraoui", "role": "Président", "slug": "hatim_elguerraoui_president", "box": (650, 205, 790, 345)},
        {"name": "Saad El Khabbouli", "role": "Vice-Président", "slug": "saad_elkhabbouli_vice_president", "box": (230, 485, 360, 615)},
        {"name": "Maryam Saber", "role": "Vice-Présidente", "slug": "maryam_saber_vice_president", "box": (890, 485, 1020, 615)},
        {"name": "Aya Jei", "role": "Secrétaire Générale", "slug": "aya_jei_secretaire_generale", "box": (135, 700, 260, 825)},
        {"name": "Douaae Abla", "role": "Chef de Projet", "slug": "douaae_abla_chef_projet", "box": (560, 700, 685, 825)},
        {"name": "Elhoussein Ettallab", "role": "Trésorier", "slug": "elhoussein_ettallab_tresorier", "box": (1000, 700, 1125, 825)},
        {"name": "Anas Essaghir", "role": "Directeur Artistique", "slug": "anas_essaghir_directeur_artistique", "box": (135, 910, 260, 1035)},
        {"name": "Yassir El Kinani", "role": "Responsable Média", "slug": "yassir_elkinani_respo_media", "box": (560, 910, 685, 1035)},
        {"name": "Zyad Mrabet", "role": "Responsable Logistique", "slug": "zyad_mrabet_respo_logistique", "box": (1000, 910, 1125, 1035)},
        {"name": "Salwa Jawadi", "role": "Responsable Section Anglaise", "slug": "salwa_jawadi_respo_sec_ang", "box": (135, 1130, 260, 1255)},
        {"name": "Ihssane Rouadha", "role": "Responsable Section Française", "slug": "ihssane_rouadha_respo_sec_fr", "box": (560, 1130, 685, 1255)},
        {"name": "Hafsa Ouagague", "role": "Responsable Section Arabe", "slug": "hafsa_ouagague_respo_sec_ar", "box": (1000, 1130, 1125, 1255)}
    ]

    out_dir = "instagram/team"
    os.makedirs(out_dir, exist_ok=True)
    
    team_catalog = []
    for m in members:
        cropped = im.crop(m["box"])
        filename = f"member_{m['slug']}.jpg"
        out_path = os.path.join(out_dir, filename)
        cropped.save(out_path, quality=95)
        print(f"  ✓ Cropped {m['name']} ({m['role']}) -> {out_path}")
        team_catalog.append({
            "name": m["name"],
            "role": m["role"],
            "filename": filename,
            "path": out_path
        })

    with open("instagram/metadata/team_members_2025_2026.json", "w", encoding="utf-8") as f:
        json.dump(team_catalog, f, indent=2, ensure_ascii=False)
        
    print(f"\n[✓] Successfully cropped and saved all 12 executive board members to {out_dir}!")

if __name__ == "__main__":
    crop_team_members()
