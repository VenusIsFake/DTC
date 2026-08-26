"use client";

import React, { useRef, useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { Committee, Profile, SiteSettings } from "@/lib/types";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient, publicStorageUrl } from "@/lib/supabase/client";
import AvatarCropModal from "@/components/espace/AvatarCropModal";
import { Field, PrimaryButton, inputClass } from "@/components/ui/form";
import UserAvatar from "@/components/UserAvatar";

export default function ProfileEditor({
  profile,
  committees,
  settings,
}: {
  profile: Profile;
  committees: Committee[];
  settings: SiteSettings;
}) {
  const { user, refreshProfile, profile: liveProfile } = useAuth();
  const [fullName, setFullName] = useState(profile.full_name);
  const [promo, setPromo] = useState<string>(profile.promo ? String(profile.promo) : "");
  const [committeeId, setCommitteeId] = useState(profile.committee_id ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [phone, setPhone] = useState(profile.phone);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
    const url = URL.createObjectURL(file);
    setSelectedImageSrc(url);
    setCropModalOpen(true);
  };

  const handleCropClose = () => {
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
    setSelectedImageSrc(null);
    setCropModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) throw new Error("Base de données non disponible.");
    setMessage(null);

    const path = `${user.id}/avatar-${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (uploadError) throw uploadError;

    const url = publicStorageUrl("avatars", path);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);
    if (updateError) throw updateError;

    await refreshProfile();
    setAvatarVersion((v) => v + 1);
    setMessage({ kind: "ok", text: "Photo de profil mise à jour." });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: fullName.trim(),
        promo: promo ? Number(promo) : null,
        committee_id: committeeId || null,
        bio: bio.trim(),
        phone: phone.trim(),
      }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      setMessage({ kind: "ok", text: "Profil enregistré." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Échec de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="glass-card rounded-lg border border-[#DCD7CB]/40 p-4 sm:p-7 space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <UserAvatar
            key={`${avatarVersion}-${liveProfile?.avatar_url ?? "none"}`}
            name={fullName}
            src={liveProfile?.avatar_url ?? profile.avatar_url}
            size={72}
            className="!w-18 !h-18"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-[#16233A]">Photo de profil</p>
          <p className="text-[11px] text-[#5C6672]">
            Visible par les membres dans l&apos;annuaire. Choisissez et cadrez votre photo.
          </p>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold border border-[#DCD7CB]/60 text-[#3D4A58] hover:border-[#755B18]/50 hover:text-[#755B18] cursor-pointer transition-all">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
            />
            <span>Choisir une photo</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Nom complet" htmlFor="profile-name">
          <input
            id="profile-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email (fixe)" htmlFor="profile-email" hint="L'email du compte ne se modifie pas ici.">
          <input id="profile-email" type="email" value={profile.email} disabled className={inputClass} />
        </Field>
        <Field label="Année (promo)" htmlFor="profile-promo">
          <select id="profile-promo" value={promo} onChange={(e) => setPromo(e.target.value)} className={inputClass}>
            <option value="">— Non précisée —</option>
            {settings.promo_years.map((year) => (
              <option key={year} value={year}>
                Promo {year}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Commission / Pôle" htmlFor="profile-committee">
          <select
            id="profile-committee"
            value={committeeId}
            onChange={(e) => setCommitteeId(e.target.value)}
            className={inputClass}
          >
            <option value="">— Aucune —</option>
            {committees.map((committee) => (
              <option key={committee.id} value={committee.id}>
                {committee.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Téléphone" htmlFor="profile-phone" hint="Visible uniquement par le bureau et les administrateurs.">
        <input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="06 XX XX XX XX"
        />
      </Field>

      <Field label="Bio" htmlFor="profile-bio" hint="Quelques mots sur vous (parcours, passions, rôle au club…).">
        <textarea
          id="profile-bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className={`${inputClass} resize-y`}
          maxLength={1000}
        />
      </Field>

      {message && (
        <p
          role="status"
          className={`text-xs rounded-lg px-3 py-2 border ${
            message.kind === "ok"
              ? "text-emerald-700 bg-emerald-600/10 border-emerald-600/30"
              : "text-red-600 bg-red-500/10 border-red-500/30"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex justify-end">
        <PrimaryButton type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Enregistrement…" : "Enregistrer mon profil"}</span>
        </PrimaryButton>
      </div>

      <AvatarCropModal
        isOpen={cropModalOpen}
        imageSrc={selectedImageSrc}
        onClose={handleCropClose}
        onConfirm={handleCropConfirm}
      />
    </form>
  );
}
