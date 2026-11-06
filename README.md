# Bankgeheimnis im Park – Offizielle Web-App & Portal

> **Comedy, Sketche & Geheimnisse von der wohl berühmtesten Parkbank Deutschlands.**

Offizielle Web-App und interaktives Portal für das deutsche Comedy-Format **Bankgeheimnis im Park** (`@bankgeheimnisimpark`).

---

## 🌟 Features

- **Interaktives Parkbank-Hero-Banner:**
  - Automatische Anpassung für Querformat (16:9) und Hochformat (9:16).
  - Interaktive Charaktere (Bahndidos, Talahons, Punks, Talahinnen, Gen Z, Hippie, Omma, Alman Opa) mit individuellem Namens-Popup direkt auf der Figur.
  - Dynamischer Blätter-Wirbel-Effekt auf Canvas-Basis beim Antippen.

- **Offizielles Browsergame: Parkbank-Duell:**
  - Direktes Online-Spielen von `https://parkbank-duell.vercel.app/` im Vollbild-Theater-Modal ohne Download.
  - Unterstützt Touch- und Desktop-Steuerung.

- **Offizielle Comedy-Videos & Sketche:**
  - Kategorisierte Folgen: *Omma & Opa Sketche*, *Bahndidos*, *Kevin (Gen Z)* und *VIP Special*.
  - Schneller integrierter Video-Player mit Like-Funktion.

- **Mitgliederbereich & VIP Ehren-Rentner Abo:**
  - Login & Registrierung mit lokalem Speicher (Local Storage).
  - Exklusiver VIP-Zugang (48h Vorabzugang, unzensierte Outtakes).

- **Social Media Integration:**
  - Direkte Verlinkungen zu TikTok, Instagram, Facebook und YouTube (@bankgeheimnisimpark).

---

## 🚀 Technologie-Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Browsergame:** HTML5 / WebGL Integration (Parkbank-Duell)

---

## 💻 Lokale Installation & Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/stoni-23/Bankgeheimnis-im-Park.git
cd Bankgeheimnis-im-Park

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev

# 4. Produktions-Build erstellen
npm run build
```

---

## 📜 Lizenz & Copyright

© 2026 Bankgeheimnis im Park. Alle Rechte vorbehalten.


---

## Admin: Parkbank-Duell-Statistiken

Im bestehenden Admin-Panel gibt es den Tab **Parkbank-Duell**. Dafür auf Vercel (nur Server-Env, keine `VITE_`-Keys):

- `ADMIN_PIN` – Pflicht; ohne gesetzten PIN antwortet die Admin-API mit 503 (kein Default-PIN).
- `SUPABASE_DUELL_URL` – Projekt-URL der Parkbank-Duell-Supabase.
- `SUPABASE_DUELL_SECRET_KEY` – Service-Role-/Secret-Key derselben DB (nie im Client).

Zusätzlich muss in der Duell-Datenbank die SQL-Migration `027_admin_duell_stats.sql` (Repo wortduell, Ordner `online/sql`) eingespielt sein.
