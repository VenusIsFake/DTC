import os
import json
import shutil
from PIL import Image

def label_all_images():
    base_dir = "data/instagram/organized"
    labeled_dir = "data/instagram/labeled"
    os.makedirs(labeled_dir, exist_ok=True)
    
    # Detailed metadata mapping for all 36 extracted images
    image_metadata = {
        # Magisterium Announcement Posters (DVW4Kc3gMqe)
        "2026-03-01_DVW4Kc3gMqe_cover_0.jpg": {
            "title": "Magisterium 2nd Edition - Official Event Banner",
            "semantic_name": "magisterium_2026_main_banner.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Poster", "Ramadaniyat", "Calligraphy", "Lantern", "DTC Logo", "CSD Logo", "FMDC"],
            "description": "Official cover poster for Magisterium 2nd Edition (7-8 March 2026) featuring Ramadan lantern, Arabic calligraphy, DTC and CSD logos."
        },
        "2026-03-01_DVW4Kc3gMqe_sidecar_item_2.jpg": {
            "title": "Magisterium N°1 - Hatim Elguerraoui",
            "semantic_name": "magisterium_2026_speaker_01_hatim_elguerraoui.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Speaker", "Hatim Elguerraoui", "Forensic Odontology", "Lecture"],
            "description": "Speaker announcement for Mr. Hatim Elguerraoui on 'L\'odontologie Légale : Parole après la mort'."
        },
        "2026-03-01_DVW4Kc3gMqe_sidecar_item_3.jpg": {
            "title": "Magisterium N°2 - Chafik Khalifi",
            "semantic_name": "magisterium_2026_speaker_02_chafik_khalifi.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Speaker", "Chafik Khalifi", "Radiotherapy", "Oral Positioning", "Lecture"],
            "description": "Speaker announcement for Mr. Chafik Khalifi on 'Les dispositifs de positionnement oraux en radiothérapie cervico-faciale'."
        },
        "2026-03-01_DVW4Kc3gMqe_sidecar_item_4.jpg": {
            "title": "Magisterium N°3 - Wassim Ezzahoum",
            "semantic_name": "magisterium_2026_speaker_03_wassim_ezzahoum.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Speaker", "Wassim Ezzahoum", "Digital Twin", "Predictive Dentistry", "Lecture"],
            "description": "Speaker announcement for Mr. Wassim Ezzahoum on 'Digital Twin : Vers une dentisterie prédictive'."
        },
        "2026-03-01_DVW4Kc3gMqe_sidecar_item_5.jpg": {
            "title": "Magisterium N°4 - Fahd Rahim",
            "semantic_name": "magisterium_2026_speaker_04_fahd_rahim.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Speaker", "Fahd Rahim", "Implantology", "AI Robotics", "Lecture"],
            "description": "Speaker announcement for Mr. Fahd Rahim on 'The Evolution of Dental Implantology: From Freehand Surgery to AI-Guided Robotics'."
        },
        "2026-03-01_DVW4Kc3gMqe_sidecar_item_6.jpg": {
            "title": "Magisterium N°5 - Aya Zizi",
            "semantic_name": "magisterium_2026_speaker_05_aya_zizi.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Speaker", "Aya Zizi", "Stress", "Oral Health", "Lecture"],
            "description": "Speaker announcement for Mme. Aya Zizi on 'Le Stress : L\'ennemi silencieux de la santé bucco-dentaire'."
        },
        "2026-03-01_DVW4Kc3gMqe_sidecar_item_7.jpg": {
            "title": "Magisterium N°6 - Reda Rimaoui",
            "semantic_name": "magisterium_2026_speaker_06_reda_rimaoui.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Speaker", "Reda Rimaoui", "Subconscious", "Psychology", "Lecture"],
            "description": "Speaker announcement for Mr. Reda Rimaoui on 'Le Subconscient : L\'architecte invisible de votre réalité'."
        },

        # Magisterium Ceremony & Presentations (DVuA9-UAGHV)
        "2026-03-10_DVuA9-UAGHV_cover_0.jpg": {
            "title": "Trophy Presentation - Hatim Elguerraoui",
            "semantic_name": "magisterium_2026_award_hatim_elguerraoui.jpg",
            "category": "Awards & Ceremonies",
            "tags": ["Magisterium", "Award", "Trophy", "Hatim Elguerraoui", "Professor", "Ceremony"],
            "description": "Faculty professor presenting the Magisterium 2 trophy award to Mr. Hatim Elguerraoui on stage."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_2.jpg": {
            "title": "Trophy Presentation - Fahd Rahim",
            "semantic_name": "magisterium_2026_award_fahd_rahim.jpg",
            "category": "Awards & Ceremonies",
            "tags": ["Magisterium", "Award", "Trophy", "Fahd Rahim", "Professor", "Ceremony"],
            "description": "Faculty professor awarding the Magisterium 2 trophy to speaker Mr. Fahd Rahim."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_3.jpg": {
            "title": "Trophy Presentation - Aya Zizi",
            "semantic_name": "magisterium_2026_award_aya_zizi.jpg",
            "category": "Awards & Ceremonies",
            "tags": ["Magisterium", "Award", "Trophy", "Aya Zizi", "Professor", "Ceremony"],
            "description": "Faculty professor awarding the Magisterium 2 trophy to speaker Mme. Aya Zizi."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_4.jpg": {
            "title": "Trophy Presentation - Chafik Khalifi",
            "semantic_name": "magisterium_2026_award_chafik_khalifi.jpg",
            "category": "Awards & Ceremonies",
            "tags": ["Magisterium", "Award", "Trophy", "Chafik Khalifi", "Professor", "Ceremony"],
            "description": "Faculty professor awarding the Magisterium 2 trophy to speaker Mr. Chafik Khalifi."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_5.jpg": {
            "title": "Trophy Presentation - Wassim Ezzahoum",
            "semantic_name": "magisterium_2026_award_wassim_ezzahoum.jpg",
            "category": "Awards & Ceremonies",
            "tags": ["Magisterium", "Award", "Trophy", "Wassim Ezzahoum", "Professor", "Ceremony"],
            "description": "Faculty professor awarding the Magisterium 2 trophy to speaker Mr. Wassim Ezzahoum."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_6.jpg": {
            "title": "Trophy Presentation - Reda Rimaoui",
            "semantic_name": "magisterium_2026_award_reda_rimaoui.jpg",
            "category": "Awards & Ceremonies",
            "tags": ["Magisterium", "Award", "Trophy", "Reda Rimaoui", "Professor", "Ceremony"],
            "description": "Faculty professor awarding the Magisterium 2 trophy to speaker Mr. Reda Rimaoui."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_7.jpg": {
            "title": "Keynote Speech by Magisterium President",
            "semantic_name": "magisterium_2026_president_keynote.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Keynote", "President", "Stage", "Podium", "Speech"],
            "description": "President of Magisterium 2nd Edition addressing the audience from the stage podium."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_8.jpg": {
            "title": "Forensic Odontology Magistral Lecture",
            "semantic_name": "magisterium_2026_lecture_hatim_elguerraoui.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Lecture", "Forensic Odontology", "Hatim Elguerraoui", "Presentation"],
            "description": "Hatim Elguerraoui delivering his magistral lecture on forensic dentistry before the jury."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_9.jpg": {
            "title": "Implantology & AI Robotics Lecture",
            "semantic_name": "magisterium_2026_lecture_fahd_rahim.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Lecture", "Implantology", "AI", "Fahd Rahim", "Presentation"],
            "description": "Fahd Rahim delivering his lecture on dental implantology evolution and AI-guided robotics."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_10.jpg": {
            "title": "Stress & Oral Health Lecture",
            "semantic_name": "magisterium_2026_lecture_aya_zizi.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Lecture", "Oral Health", "Aya Zizi", "Presentation"],
            "description": "Aya Zizi presenting her lecture on the silent impact of stress on oral-dental health."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_11.jpg": {
            "title": "Radiotherapy Positioning Devices Lecture",
            "semantic_name": "magisterium_2026_lecture_chafik_khalifi.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Lecture", "Radiotherapy", "Chafik Khalifi", "Presentation"],
            "description": "Chafik Khalifi delivering his lecture on oral positioning devices in cervico-facial radiotherapy."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_12.jpg": {
            "title": "Digital Twin in Dentistry Lecture",
            "semantic_name": "magisterium_2026_lecture_wassim_ezzahoum.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Lecture", "Digital Twin", "Wassim Ezzahoum", "Presentation"],
            "description": "Wassim Ezzahoum delivering his lecture on Digital Twin models for predictive dentistry."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_13.jpg": {
            "title": "Subconscious Architecture Lecture",
            "semantic_name": "magisterium_2026_lecture_reda_rimaoui.jpg",
            "category": "Academic Event / Magisterium",
            "tags": ["Magisterium", "Lecture", "Psychology", "Reda Rimaoui", "Presentation"],
            "description": "Reda Rimaoui presenting his lecture on the subconscious mind as the invisible architect of reality."
        },
        "2026-03-10_DVuA9-UAGHV_sidecar_item_14.jpg": {
            "title": "Magisterium Grand Finale Group Photo",
            "semantic_name": "magisterium_2026_grand_finale_group.jpg",
            "category": "Community & Groups",
            "tags": ["Magisterium", "Group Photo", "Professors", "Speakers", "Stage", "Finale"],
            "description": "Grand finale group photograph on stage featuring all speakers, faculty jury professors, and organizing committee."
        },

        # Forensic Odontology Video / Reel Cover (DXVKKThoffz)
        "2026-04-19_DXVKKThoffz_cover_0.jpg": {
            "title": "Forensic Odontology Keynote Reel Cover",
            "semantic_name": "forensic_odontology_keynote_reel_cover.jpg",
            "category": "Reels & Video Covers",
            "tags": ["Reel Cover", "Forensic Odontology", "Hatim Elguerraoui", "Magisterium"],
            "description": "Video reel cover for the Magisterium presentation on forensic dentistry."
        },

        # Let's Talk Podcasts (DVO28f3Daez & DXAEliYDW5w)
        "2026-02-26_DVO28f3Daez_cover_0.jpg": {
            "title": "Let's Talk Podcast Ep. 4 Teaser Cover",
            "semantic_name": "lets_talk_podcast_ep4_teaser_cover.jpg",
            "category": "Podcasts & Media",
            "tags": ["Podcast", "Teaser", "Prof. Bouzoubaa", "DTC", "CSD"],
            "description": "Teaser reel artwork for Episode 4 of Let's Talk Podcast featuring Prof. Sidi Mohamed Bouzoubaa."
        },
        "2026-04-11_DXAEliYDW5w_cover_0.jpg": {
            "title": "Let's Talk Podcast Ep. 4 YouTube Release Poster",
            "semantic_name": "lets_talk_podcast_ep4_youtube_poster.jpg",
            "category": "Podcasts & Media",
            "tags": ["Podcast", "YouTube Release", "Prof. Bouzoubaa", "FlexDental Sponsor"],
            "description": "Full YouTube episode release poster for Let's Talk Podcast Episode 4 with Prof. Bouzoubaa, sponsored by FlexDental."
        },

        # Club Milestones, Team & History (DYmzT1XDdSw)
        "2026-05-21_DYmzT1XDdSw_cover_0.jpg": {
            "title": "TEDxFMDC Club & Faculty Group Photo",
            "semantic_name": "tedx_fmdc_amphitheater_group_photo.jpg",
            "category": "Milestones & Major Events",
            "tags": ["TEDxFMDC", "Auditorium", "Club Members", "Faculty Professors", "Major Milestone"],
            "description": "Large group portrait of Dentalk Club members and FMDC professors holding large 3D 'TEDx' letters on auditorium stage."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_2.jpg": {
            "title": "Executive Board Flower Presentation to Faculty Advisor",
            "semantic_name": "executive_board_advisor_flower_presentation.jpg",
            "category": "Team & Governance",
            "tags": ["Executive Board", "Faculty Advisor", "Bouquet", "Studio", "Appreciation"],
            "description": "Dentalk Club executive board presenting a vibrant floral bouquet to their faculty advisor in studio setting."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_3.jpg": {
            "title": "Dentalk Live Debate Table Session",
            "semantic_name": "dentalk_live_debate_table_session.jpg",
            "category": "Debates & Workshops",
            "tags": ["Debate", "Public Speaking", "Classroom", "Students", "Eloquence"],
            "description": "Two club members engaged in a lively head-to-head debate table session observed by fellow students."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_4.jpg": {
            "title": "Team Bonding Retreat & Outdoor Gathering",
            "semantic_name": "team_bonding_outdoor_retreat.jpg",
            "category": "Team & Social",
            "tags": ["Team", "Retreat", "Outdoor", "Bonding", "Community"],
            "description": "Dentalk Club members gathered outdoors enjoying team bonding and fellowship."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_5.jpg": {
            "title": "Auditorium Eloquence Competition Keynote",
            "semantic_name": "auditorium_eloquence_keynote_stage.jpg",
            "category": "Debates & Workshops",
            "tags": ["Amphitheater", "Speech", "Stage", "Audience", "Eloquence"],
            "description": "Club speaker delivering an inspiring address in the packed FMDC amphitheater."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_6.jpg": {
            "title": "Interactive Debate Roundtable & Audience Discussion",
            "semantic_name": "debate_roundtable_audience_discussion.jpg",
            "category": "Debates & Workshops",
            "tags": ["Roundtable", "Discussion", "Members", "Interactive Debate"],
            "description": "Club members participating in an open roundtable discussion exchanging perspectives."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_7.jpg": {
            "title": "Club Leadership Strategy Meeting",
            "semantic_name": "club_leadership_strategy_meeting.jpg",
            "category": "Team & Governance",
            "tags": ["Leadership", "Strategy", "Meeting", "Planning"],
            "description": "Core organizers and leadership team coordinating event logistics and club initiatives."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_8.jpg": {
            "title": "Behind-the-Scenes: Podcast Studio DSLR Viewfinder",
            "semantic_name": "podcast_studio_bts_camera_viewfinder.jpg",
            "category": "Behind The Scenes",
            "tags": ["Behind The Scenes", "Podcast", "Studio", "Camera Viewfinder", "Production"],
            "description": "DSLR camera viewfinder shot capturing podcast hosts in the recording studio with microphones and iPad."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_9.jpg": {
            "title": "Outdoor Club Fellowship & Group Celebration",
            "semantic_name": "outdoor_club_fellowship_celebration.jpg",
            "category": "Team & Social",
            "tags": ["Celebration", "Outdoor", "Fellowship", "Members"],
            "description": "Smiling members celebrating a successful event during an outdoor gathering."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_10.jpg": {
            "title": "Magisterium Organizing Committee Stage Portrait",
            "semantic_name": "magisterium_organizing_committee_stage_portrait.jpg",
            "category": "Community & Groups",
            "tags": ["Organizing Committee", "Magisterium", "Stage", "Team Portrait"],
            "description": "Full organizing committee portrait on the main event stage following the Magisterium ceremony."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_11.jpg": {
            "title": "Eloquence Workshop Interactive Activity",
            "semantic_name": "eloquence_workshop_interactive_activity.jpg",
            "category": "Debates & Workshops",
            "tags": ["Workshop", "Soft Skills", "Eloquence", "Training"],
            "description": "Interactive soft-skills training exercise during a club public speaking workshop."
        },
        "2026-05-21_DYmzT1XDdSw_sidecar_item_12.jpg": {
            "title": "Inaugural Mandate Celebration & Handover Gala",
            "semantic_name": "inaugural_mandate_handover_gala.jpg",
            "category": "Milestones & Major Events",
            "tags": ["Gala", "Mandate Handover", "Celebration", "Milestone", "Family"],
            "description": "Joyful celebration of the founding mandate completion and welcome to the incoming executive board."
        }
    }

    labeled_catalog = []
    
    # Process and copy files with semantic names
    for raw_name, meta in image_metadata.items():
        # Find raw source file
        src_path = None
        for root, dirs, files in os.walk("data/instagram/organized"):
            if raw_name in files:
                src_path = os.path.join(root, raw_name)
                break
                
        if not src_path or not os.path.exists(src_path):
            print(f"Warning: source file {raw_name} not found")
            continue
            
        category_slug = meta["category"].lower().replace(" / ", "_").replace(" & ", "_").replace(" ", "_")
        target_subfolder = os.path.join(labeled_dir, category_slug)
        os.makedirs(target_subfolder, exist_ok=True)
        
        dest_path = os.path.join(target_subfolder, meta["semantic_name"])
        shutil.copy2(src_path, dest_path)
        
        with Image.open(dest_path) as im:
            w, h = im.size
            fmt = im.format
            
        record = {
            "original_filename": raw_name,
            "semantic_filename": meta["semantic_name"],
            "title": meta["title"],
            "category": meta["category"],
            "relative_path": dest_path,
            "dimensions": f"{w}x{h}",
            "format": fmt,
            "tags": meta["tags"],
            "description": meta["description"]
        }
        labeled_catalog.append(record)

    # Save labeled catalog
    output_json = "data/instagram/labeled_images_catalog.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(labeled_catalog, f, indent=2, ensure_ascii=False)
        
    print(f"[✓] Labeled and organized {len(labeled_catalog)} images in {labeled_dir}!")
    return labeled_catalog

if __name__ == "__main__":
    label_all_images()
