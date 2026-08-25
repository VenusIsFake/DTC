import os
import shutil
import json

def reorganize():
    source_labeled = "data/instagram/labeled"
    dest_root = "instagram"
    
    # 5 clean and effective category folders
    folders = {
        "magisterium": os.path.join(dest_root, "magisterium"),
        "awards": os.path.join(dest_root, "awards"),
        "podcasts": os.path.join(dest_root, "podcasts"),
        "events": os.path.join(dest_root, "events"),
        "team": os.path.join(dest_root, "team"),
        "metadata": os.path.join(dest_root, "metadata")
    }

    for f in folders.values():
        os.makedirs(f, exist_ok=True)

    # Exact mapping: (labeled_subfolder, current_filename) -> (new_folder_key, clean_filename, title, description)
    file_mapping = [
        # Magisterium
        ("academic_event_magisterium", "magisterium_2026_main_banner.jpg", "magisterium", "banner_2026.jpg", "Magisterium 2026 Main Banner", "Official Ramadan edition poster with calligraphy and DTC logo"),
        ("academic_event_magisterium", "magisterium_2026_president_keynote.jpg", "magisterium", "keynote_president.jpg", "President Opening Address", "Opening address by the Magisterium 2026 President"),
        ("academic_event_magisterium", "magisterium_2026_speaker_01_hatim_elguerraoui.jpg", "magisterium", "speaker_01_hatim_elguerraoui.jpg", "Speaker Hatim Elguerraoui Announcement", "Forensic Odontology lecture announcement"),
        ("academic_event_magisterium", "magisterium_2026_speaker_02_chafik_khalifi.jpg", "magisterium", "speaker_02_chafik_khalifi.jpg", "Speaker Chafik Khalifi Announcement", "Radiotherapy positioning devices announcement"),
        ("academic_event_magisterium", "magisterium_2026_speaker_03_wassim_ezzahoum.jpg", "magisterium", "speaker_03_wassim_ezzahoum.jpg", "Speaker Wassim Ezzahoum Announcement", "Digital Twin in dentistry announcement"),
        ("academic_event_magisterium", "magisterium_2026_speaker_04_fahd_rahim.jpg", "magisterium", "speaker_04_fahd_rahim.jpg", "Speaker Fahd Rahim Announcement", "AI-guided robotics implantology announcement"),
        ("academic_event_magisterium", "magisterium_2026_speaker_05_aya_zizi.jpg", "magisterium", "speaker_05_aya_zizi.jpg", "Speaker Aya Zizi Announcement", "Stress and oral health announcement"),
        ("academic_event_magisterium", "magisterium_2026_speaker_06_reda_rimaoui.jpg", "magisterium", "speaker_06_reda_rimaoui.jpg", "Speaker Reda Rimaoui Announcement", "Subconscious architecture announcement"),
        ("academic_event_magisterium", "magisterium_2026_lecture_hatim_elguerraoui.jpg", "magisterium", "lecture_01_hatim_elguerraoui.jpg", "Lecture Hatim Elguerraoui", "Live forensic dentistry lecture before jury"),
        ("academic_event_magisterium", "magisterium_2026_lecture_chafik_khalifi.jpg", "magisterium", "lecture_02_chafik_khalifi.jpg", "Lecture Chafik Khalifi", "Live radiotherapy positioning devices lecture"),
        ("academic_event_magisterium", "magisterium_2026_lecture_wassim_ezzahoum.jpg", "magisterium", "lecture_03_wassim_ezzahoum.jpg", "Lecture Wassim Ezzahoum", "Live digital twin dentistry lecture"),
        ("academic_event_magisterium", "magisterium_2026_lecture_fahd_rahim.jpg", "magisterium", "lecture_04_fahd_rahim.jpg", "Lecture Fahd Rahim", "Live implantology robotics lecture"),
        ("academic_event_magisterium", "magisterium_2026_lecture_aya_zizi.jpg", "magisterium", "lecture_05_aya_zizi.jpg", "Lecture Aya Zizi", "Live stress in oral health lecture"),
        ("academic_event_magisterium", "magisterium_2026_lecture_reda_rimaoui.jpg", "magisterium", "lecture_06_reda_rimaoui.jpg", "Lecture Reda Rimaoui", "Live subconscious psychology lecture"),
        ("reels_video_covers", "forensic_odontology_keynote_reel_cover.jpg", "magisterium", "reel_forensic_odontology.jpg", "Forensic Odontology Keynote Reel", "Video reel cover for forensic dentistry talk"),

        # Awards
        ("awards_ceremonies", "magisterium_2026_award_hatim_elguerraoui.jpg", "awards", "trophy_hatim_elguerraoui.jpg", "Trophy Presentation - Hatim Elguerraoui", "Faculty professor presenting trophy to Hatim Elguerraoui"),
        ("awards_ceremonies", "magisterium_2026_award_chafik_khalifi.jpg", "awards", "trophy_chafik_khalifi.jpg", "Trophy Presentation - Chafik Khalifi", "Faculty professor presenting trophy to Chafik Khalifi"),
        ("awards_ceremonies", "magisterium_2026_award_wassim_ezzahoum.jpg", "awards", "trophy_wassim_ezzahoum.jpg", "Trophy Presentation - Wassim Ezzahoum", "Faculty professor presenting trophy to Wassim Ezzahoum"),
        ("awards_ceremonies", "magisterium_2026_award_fahd_rahim.jpg", "awards", "trophy_fahd_rahim.jpg", "Trophy Presentation - Fahd Rahim", "Faculty professor presenting trophy to Fahd Rahim"),
        ("awards_ceremonies", "magisterium_2026_award_aya_zizi.jpg", "awards", "trophy_aya_zizi.jpg", "Trophy Presentation - Aya Zizi", "Faculty professor presenting trophy to Aya Zizi"),
        ("awards_ceremonies", "magisterium_2026_award_reda_rimaoui.jpg", "awards", "trophy_reda_rimaoui.jpg", "Trophy Presentation - Reda Rimaoui", "Faculty professor presenting trophy to Reda Rimaoui"),
        ("community_groups", "magisterium_2026_grand_finale_group.jpg", "awards", "grand_finale_group.jpg", "Grand Finale Stage Group Photo", "Speakers and faculty jury on stage"),

        # Podcasts
        ("podcasts_media", "lets_talk_podcast_ep4_youtube_poster.jpg", "podcasts", "ep4_youtube_poster.jpg", "Let's Talk Podcast Ep. 4 Poster", "YouTube poster with Prof. Sidi Mohamed Bouzoubaa"),
        ("podcasts_media", "lets_talk_podcast_ep4_teaser_cover.jpg", "podcasts", "ep4_teaser_cover.jpg", "Let's Talk Podcast Ep. 4 Teaser", "Teaser reel artwork for Ep. 4"),
        ("behind_the_scenes", "podcast_studio_bts_camera_viewfinder.jpg", "podcasts", "studio_bts_viewfinder.jpg", "Studio Recording BTS Viewfinder", "Camera viewfinder shot of podcast recording"),

        # Events & Workshops
        ("milestones_major_events", "tedx_fmdc_amphitheater_group_photo.jpg", "events", "tedx_fmdc_auditorium.jpg", "TEDxFMDC Amphitheater Group", "Club members and faculty with 3D TEDx letters"),
        ("debates_workshops", "dentalk_live_debate_table_session.jpg", "events", "debate_table_session.jpg", "Live Debate Table Session", "Head-to-head student debate match"),
        ("debates_workshops", "debate_roundtable_audience_discussion.jpg", "events", "debate_roundtable.jpg", "Debate Roundtable Discussion", "Interactive student debate circle"),
        ("debates_workshops", "auditorium_eloquence_keynote_stage.jpg", "events", "eloquence_keynote_stage.jpg", "Amphitheater Eloquence Keynote", "Speech from the main auditorium stage"),
        ("debates_workshops", "eloquence_workshop_interactive_activity.jpg", "events", "eloquence_workshop.jpg", "Eloquence Workshop Drills", "Soft-skills communication workshop activity"),
        ("milestones_major_events", "inaugural_mandate_handover_gala.jpg", "events", "mandate_handover_gala.jpg", "Inaugural Mandate Handover Gala", "Celebration of mandate completion and transition"),

        # Team & Social
        ("team_governance", "executive_board_advisor_flower_presentation.jpg", "team", "advisor_flower_tribute.jpg", "Faculty Advisor Floral Tribute", "Executive board presenting flowers to faculty advisor"),
        ("team_governance", "club_leadership_strategy_meeting.jpg", "team", "leadership_meeting.jpg", "Club Leadership Strategy Meeting", "Core organizers planning club roadmap"),
        ("community_groups", "magisterium_organizing_committee_stage_portrait.jpg", "team", "organizing_committee_stage.jpg", "Organizing Committee Stage Portrait", "Full team portrait on stage"),
        ("team_social", "team_bonding_outdoor_retreat.jpg", "team", "outdoor_retreat.jpg", "Team Outdoor Retreat", "Members fellowship in natural retreat"),
        ("team_social", "outdoor_club_fellowship_celebration.jpg", "team", "outdoor_celebration.jpg", "Outdoor Team Celebration", "Team celebration following successful event")
    ]

    catalog = []
    seen_destinations = set()

    for subfolder, src_name, cat_key, clean_name, title, desc in file_mapping:
        src_file = os.path.join(source_labeled, subfolder, src_name)
        if not os.path.exists(src_file):
            print(f"Warning: Missing source file: {src_file}")
            continue
            
        target_path = os.path.join(folders[cat_key], clean_name)
        if target_path in seen_destinations:
            print(f"Error: Duplicate target path detected: {target_path}")
            continue
        seen_destinations.add(target_path)
        
        shutil.copy2(src_file, target_path)
        catalog.append({
            "filename": clean_name,
            "category": cat_key,
            "path": target_path,
            "title": title,
            "description": desc
        })

    # Move raw JSON data to instagram/metadata
    raw_files = [
        ("data/instagram/raw/embed_data.json", "instagram/metadata/embed_data.json"),
        ("data/instagram/posts_catalog.json", "instagram/metadata/posts_catalog.json"),
    ]
    for src, dst in raw_files:
        if os.path.exists(src):
            shutil.copy2(src, dst)

    with open("instagram/metadata/catalog.json", "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)

    print(f"[✓] Successfully reorganized {len(catalog)} unique images across {len(folders)-1} categories under /instagram!")
    
    # Remove old data folder entirely
    if os.path.exists("data"):
        shutil.rmtree("data")
        print("[✓] Removed old 'data/' folder entirely.")

if __name__ == "__main__":
    reorganize()
