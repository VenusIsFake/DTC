# Brand Guidelines v1.0 — Dentalk Club FMDC (DTC)

> Last updated: 2026-08-27  
> Status: Active / Production  
> Organization: Dentalk Club FMDC (Faculté de Médecine Dentaire de Casablanca, UH2C)  

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #16233A |
| Secondary Color | #755B18 |
| Accent Color | #D4AF37 |
| Primary Font | Inter |
| Heading Font | Source Serif 4 |
| Voice | Eloquent, Academic, Confident, Empathetic |

---

## 1. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Midnight Navy (Ink) | #16233A | rgb(22,35,58) | Primary headers, dark backgrounds, high-contrast text |
| Navy Light (Card Surface) | #1E2E47 | rgb(30,46,71) | Dark container surfaces, subtle dark borders |
| Navy Dark (Deep Canvas) | #0B132B | rgb(11,19,43) | Maximum depth accents, footer backdrop |

### Secondary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Heritage Gold Dark | #755B18 | rgb(117,91,24) | Primary accent on light paper backgrounds (WCAG AA 4.5:1+), subheadings |
| Prestige Gold Bright | #D4AF37 | rgb(212,175,55) | Accent on dark navy backgrounds, awards, trophy badges, glows |
| Gold Muted | #8A6D1F | rgb(138,109,31) | Secondary badge borders, subtle gold hover states |

### Neutral Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Paper (Background) | #F7F5F0 | rgb(247,245,240) | Primary light canvas, page backdrop |
| Paper Deep | #EDEAE1 | rgb(237,234,225) | Scrollbar tracks, nested light panels |
| Paper Wash | #EFECE4 | rgb(239,236,228) | Card hover states, pill badges, subtle section fills |
| Paper Line | #DCD7CB | rgb(220,215,203) | Hairline borders, structural card dividers |
| Pure Surface | #FFFFFF | rgb(255,255,255) | Elevated light cards, modal panels |
| Ink Muted | #5C6672 | rgb(92,102,114) | Body text secondary, metadata, timestamps, captions |

### Semantic Colors

| State | Hex | Usage |
|-------|-----|-------|
| Success | #16A34A | Positive attendance status, confirmed RSVPs, approval badges |
| Warning | #D97706 | Pending review, workshop capacity limits, alerts |
| Error | #DC2626 | Form validation errors, destructive moderation, banned status |
| Info | #2563EB | Informational banners, system notices, link citations |

### Accessibility Standards
- **Text on Light Paper (`#F7F5F0`):** `#16233A` provides `12.5:1` (AAA); `#755B18` provides `4.8:1` (AA).
- **Text on Dark Navy (`#16233A`):** `#F7F5F0` provides `12.5:1` (AAA); `#D4AF37` provides `7.6:1` (AAA).
- **Minimum Interactive Target:** 44×44px with clear focus-visible outlines.

---

## 2. Typography

### Font Stack

```css
--font-heading: 'Source Serif 4', 'Georgia', serif;
--font-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Element | Size (Desktop) | Size (Mobile) | Weight | Line Height | Tracking |
|---------|----------------|---------------|--------|-------------|----------|
| Display | 68px (4.25rem) | 36px (2.25rem)| 600 | 1.05 | -0.025em |
| H1 | 48px (3rem) | 30px (1.875rem)| 600 | 1.15 | -0.02em |
| H2 | 32px (2rem) | 22px (1.375rem)| 600 | 1.25 | -0.015em |
| H3 | 24px (1.5rem) | 18px (1.125rem)| 600 | 1.3 | 0 |
| Overline | 12px (0.75rem) | 11px (0.6875rem)| 600 | 1.4 | 0.18em (Uppercase) |
| Body Large | 18px (1.125rem)| 16px (1rem) | 400 | 1.6 | 0 |
| Body | 15px (0.9375rem)| 14px (0.875rem)| 400 | 1.55 | 0 |
| Small / Meta | 13px (0.8125rem)| 12px (0.75rem)| 400 | 1.5 | 0 |
| Caption | 11px (0.6875rem)| 10px (0.625rem)| 500 | 1.4 | 0.14em (Uppercase) |

---

## 3. Logo Usage

### Variants

| Variant | File | Use Case |
|---------|------|----------|
| Circular Emblem Vector | `public/logo.svg` | Primary high-DPI web header, hero crest, favicon sources |
| Circular Emblem PNG | `public/logo.png` | OpenGraph preview cards, raster fallback |
| Favicon & Icons | `public/favicon.ico`, `public/apple-touch-icon.png` | Browser tab & mobile home screen shortcuts |
| Profile Avatar | `instagram/metadata/dtc_profile_avatar.jpg` | Social media profiles (Instagram, YouTube) |

### Clear Space
- Minimum clear space around the emblem equals **1× the height of the outer ring stroke** (minimum 16px padding on all sides).

### Minimum Sizes
- **Digital Display:** Minimum diameter `36px` (Navbar), recommended `192px` (Hero / About).
- **Print Materials:** Minimum diameter `25mm`.

### Prohibitions (Don'ts)
- ❌ Do not rotate, slant, or distort proportions.
- ❌ Do not alter the emblem's circular geometry or re-color the tooth glyph outside `#F7F5F0` / `#FFFFFF`.
- ❌ Do not apply heavy drop shadows, outer glows, or 3D extrusions.
- ❌ Do not place the dark emblem on a low-contrast dark gray background without an explicit boundary ring.

---

## 4. Voice & Tone

### Brand Personality

| Trait | Description |
|-------|-------------|
| **Eloquent** | Articulate, thoughtful, structured, and rhetorical without being pedantic. |
| **Academic & Clinical** | Grounded in dental medicine excellence, scientific curiosity, and ethical debate. |
| **Empathetic & Confident** | Encouraging student growth, fostering debate camaraderie, and empowering future leaders. |
| **Bilingual & Global** | Seamlessly navigating French, English, and Arabic in intellectual discourse. |

### Voice Chart

| Trait | We Are | We Are Not |
|-------|--------|------------|
| Eloquent | Articulate, refined, expressive | Pretentious, stuffy, unnecessarily verbose |
| Academic | Evidence-based, clinically respectful | Dry, bureaucratic, detached from students |
| Confident | Visionary, proud of our heritage | Arrogant, dismissive of opposing viewpoints |
| Empathetic | Inclusive, supportive of public speakers | Harsh, patronizing, gatekeeping |

### Context Tone Adaptation

| Context | Tone | Example |
|---------|------|---------|
| **Hero / Platform** | Inspiring & Prestigious | *"Let your voice be heard with endless echoes."* |
| **Debate Tournament** | Rigorous & Intellectual | *"Rebuttal, ethics, and parliamentary poise."* |
| **Social / Workshops** | Dynamic & Welcoming | *"Rejoignez l'atelier d'art oratoire ce jeudi en Salle Vésale."* |
| **Podcast Broadcast** | Conversational & Deep | *"Une discussion intime sur la pédagogie et l'odontologie."* |

### Prohibited Terms

| Avoid | Reason |
|-------|--------|
| Slang & informal greetings in formal broadcasts | Undermines academic authority and professional decorum |
| Aggressive or hostile debate rhetoric | DTC debate is ethical, collaborative, and evidence-driven |
| Generic "social club" moniker | DTC is an academic eloquence, debate, and multimedia leadership organization |
| Jargon without clinical context | Alienates beginner students and interdisciplinary audiences |
| Stuffy or bureaucratic wording | DTC voice remains empathetic, dynamic, and student-centered |

---

## 5. Messaging Framework

### Core Attributes

| Attribute | Description |
|-----------|-------------|
| **Motto** | *"Let your voice be heard with endless echoes."* |
| **Mission** | Transforming future dental surgeons into confident communicators, articulate leaders, and empathetic healthcare advocates. |
| **Pillars** | 1. Art Oratoire & Éloquence · 2. Débats Parlementaires & Éthique · 3. Production Multimédia & Let's Talk Podcast · 4. Conférences Flagship (TEDxFMDC). |

### Elevator Pitches

- **10-Second Pitch:**  
  *Dentalk Club FMDC is Casablanca's premier student organization dedicated to public speaking, medical debate, and multimedia leadership.*

- **30-Second Pitch:**  
  *Founded in November 2024 at the Faculté de Médecine Dentaire de Casablanca, DTC bridges clinical excellence and human eloquence. Through weekly debate workshops, our flagship TEDxFMDC conference, and the Let's Talk Podcast, we empower dental students to become visionary leaders and articulate patient advocates.*

- **60-Second Pitch:**  
  *In modern dental medicine, technical mastery is only half the profession—effective leadership requires empathy, public speaking, and rhetorical confidence. Dentalk Club FMDC provides a vibrant multilingual ecosystem where students master parliamentary debate in French, English, and Arabic, organize high-impact symposiums like TEDxFMDC, and interview national healthcare luminaries on the Let's Talk Podcast. We are forging the articulate, compassionate healthcare leaders of tomorrow.*

---

## 6. AI Prompting & Image Generation Guidelines

### Base Prompt Template

```
cinematic photograph of Moroccan dental medicine student speaker at a grand university amphitheater podium in Casablanca, wearing tailored dark navy attire, speaking into a vintage broadcast microphone, warm prestige gold accent rim lighting, authentic academic setting, editorial magazine photography, 8k resolution, photorealistic, sharp focus
```

### Style Keywords

| Category | Keywords |
|----------|----------|
| **Lighting** | warm prestige gold rim lighting, subtle ambient glow, high-contrast chiaroscuro |
| **Subject** | dental medicine student, public speaker, parliamentary debate, eloquence podium |
| **Setting** | Casablanca faculty amphitheater, Salle Vésale, modern broadcast studio, academic library |
| **Composition** | centered subject, cinematic rule of thirds, clean depth of field, sharp foreground |
| **Aesthetic** | editorial magazine photography, 8k resolution, photorealistic, prestigious academic |

### Visual Mood Descriptors

- Prestigious academic excellence and intellectual rigor
- Warm, inspiring, and authentic Moroccan student leadership
- Clinical professionalism paired with eloquent human connection
- Elegant midnight navy and heritage gold ambient warmth

### Visual Don'ts

| Avoid | Reason |
|-------|--------|
| Cartoonish or 3D character renders | Incompatible with prestigious editorial tone |
| Distorted anatomy or floating hands | Destroys photorealism and credibility |
| Exaggerated or gory dental imagery | Must remain clinical, inspiring, and elegant |
| Neon garish or saturated artificial colors | Conflicts with warm paper and heritage gold palette |
| Casual streetwear or informal attire | DTC visual identity represents university academic dignity |

### Example Prompts

**Hero Banner**:
```
cinematic wide shot of the Casablanca Dental Faculty amphitheater stage, student orator in midnight navy suit addressing an engaged audience, warm gold accent lighting on podium, 8k editorial photography
```

**Podcast Studio Showcase**:
```
studio close-up of broadcast microphone with subtle glowing gold DTC emblem backdrop, university professor in clinical coat engaged in conversation, depth of field, cinematic lighting
```
