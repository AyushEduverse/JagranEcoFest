# JagranEcoFest

**World Environment Day 2026 -- Event Registration Web App**
*Jagran College of Arts, Science and Commerce*

---

## Project Overview

JagranEcoFest is a mobile-first, multi-step event registration web application built for **World Environment Day 2026** (5th June) at Jagran College of Arts, Science and Commerce. Students can register for a **Poster & Slogan Making Competition**, a **Quiz Competition**, or both -- through an intuitive, nature-themed interface.

All registrations are automatically stored in Google Sheets via Google Apps Script, with access restricted to the NSS Teacher (Kanika Mam). The app is distributed via WhatsApp link and QR Code on the college notice board.

An **Admin Dashboard** (`admin.html`) is included for Kanika Mam to view, search, filter, analyze, export (CSV/PDF), and manage all registrations from her desktop.

---

## Live URL

**Student Registration:** `https://ayusheduverse.github.io/JagranEcoFest`
**Admin Dashboard:** `https://ayusheduverse.github.io/JagranEcoFest/admin.html`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5 + CSS3 + Vanilla JavaScript |
| **Icons** | Font Awesome 6 Free (CDN) |
| **Fonts** | Google Fonts -- Playfair Display + DM Sans |
| **Animations** | Anime.js 3.2.1 (CDN) |
| **Backend** | Google Apps Script Web App (`doPost` / `doGet`) |
| **Database** | Google Sheets (auto-created tabs per competition) |
| **Hosting** | GitHub Pages |
| **Distribution** | WhatsApp link + QR Code |

---

## Project Structure

```
JagranEcoFest/
|
|-- index.html                 Main student registration app (HTML entry point)
|-- admin.html                 Admin dashboard for Kanika Mam (NSS Teacher)
|
|-- css/
|   |-- style.css              Design system, components, screens (student app)
|   |-- admin-style.css        Admin panel styles (desktop-first, responsive)
|
|-- js/
|   |-- script.js              Core app logic (navigation, validation, API calls)
|   |-- animations.js          Anime.js page transitions & micro-interactions
|   |-- admin.js               Admin dashboard logic (stats, table, export, settings)
|
|-- backend/
|   |-- Code.gs                Google Apps Script backend (student + admin endpoints)
|
|-- assets/
|   |-- Environment-day.jpg    Background image for event branding
|   |-- favicon.ico            Browser tab icon
|   |-- JagranEcoFest.png      Project logo / branding image
|
|-- README.md                  Project documentation (this file)
```

---

## Screens

### Student App (`index.html`)

| Screen | Description |
|--------|-------------|
| **S1 -- Welcome** | Hero landing with event info, deadline chip, "Get Started" CTA |
| **S2 -- Choose Competition** | 3 tap cards: Poster / Quiz / Both, with rules bottom sheets |
| **S3 -- Your Details** | Name + Batch input, duplicate check via GET API |
| **S4 -- Team Setup** | Quiz/Both only -- Team name, 2-3 members, captain auto-filled |
| **S5 -- Review & Submit** | Summary cards with edit buttons, POST to Apps Script |
| **S6 -- Success** | Confirmation card + event pass download (PDF) |
| **SX -- Already Registered** | Amber hero, shows existing registration details |
| **SY -- Added as Team Member** | Green hero, shows team captain & competition info |
| **SE -- Error** | Toast notification with retry option |

### Admin Panel (`admin.html`)

| Screen | Description |
|--------|-------------|
| **A1 -- Login** | Password-protected access gate |
| **A2 -- Dashboard** | Stats cards (total, poster, quiz, both, teams, today), trend chart, recent registrations |
| **A3 -- Registrations** | Full data table with search, competition/batch filters, sortable columns, pagination |
| **A4 -- Detail Modal** | Full registration view with team members, print card, delete action |
| **A5 -- Export** | CSV download + PDF export (2 registration cards per A4 page) |
| **A6 -- Settings** | Event info and admin password management |

---

## Setup: Google Apps Script

1. Open [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Go to **Extensions > Apps Script**
3. Delete all existing code, paste the contents of `backend/Code.gs`
4. Click **Deploy > New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** and copy the Web App URL
6. Open `js/script.js` and `js/admin.js`, replace the `APPS_SCRIPT_URL` value with your deployed URL:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_URL_HERE/exec';
   ```

---

## Setup: GitHub Pages

1. Push this repo to GitHub: `https://github.com/AyushEduverse/JagranEcoFest.git`
2. Go to **Settings > Pages**
3. Source: **Deploy from a branch** > `main` > `/ (root)`
4. Wait ~60 seconds for the site to go live
5. Your site will be at: `https://ayusheduverse.github.io/JagranEcoFest`

---

## QR Code Generation

1. Go to [qr.io](https://qr.io) or [qr-code-generator.com](https://www.qr-code-generator.com)
2. Paste the GitHub Pages URL: `https://ayusheduverse.github.io/JagranEcoFest`
3. Download the PNG for printing on notice boards and pamphlets

---

## WhatsApp Distribution

Message template to share:

```
*World Environment Day 2026* -- Jagran College

Register now for:
- Poster & Slogan Making
- Quiz Competition (Team of 2-3)

*Register here:*
https://ayusheduverse.github.io/JagranEcoFest

*Last date: 30 May 2026*

Organized by NSS Unit
```

---

## Admin Panel Access

- **URL:** `https://ayusheduverse.github.io/JagranEcoFest/admin.html`
- **Default Password:** `JagranEcoFest`
- The password can be changed in `backend/Code.gs` (line: `const ADMIN_PASSWORD`)
- A small "Admin" link is available in the footer of the student app (S1)

---

## Built By

**Ayush Gupta** -- BCA 3rd Year, Jagran College of Arts, Science and Commerce

---

## License

This project is built for the NSS Unit of Jagran College. All rights reserved.
