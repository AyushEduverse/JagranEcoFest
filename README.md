# 🌿 JagranEcoFest

**World Environment Day 2026 — Event Registration Web App**  
*Jagran College of Arts, Science and Commerce*

---

## Project Overview

JagranEcoFest is a mobile-first, multi-step event registration web application built for **World Environment Day 2026** (5th June) at Jagran College of Arts, Science and Commerce. Students can register for a **Poster & Slogan Making Competition**, a **Quiz Competition**, or both — through an intuitive, nature-themed interface.

All registrations are automatically stored in Google Sheets via Google Apps Script, with access restricted to the NSS Teacher (Kanika Mam). The app is distributed via WhatsApp link and QR Code on the college notice board.

---

## 🔗 Live URL

```
https://[your-username].github.io/JagranEcoFest
```

*Replace `[your-username]` with your actual GitHub username after deployment.*

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5 + CSS3 + Vanilla JavaScript |
| **Icons** | Font Awesome 6 Free (CDN) |
| **Fonts** | Google Fonts — Playfair Display + DM Sans |
| **Animations** | Anime.js 3.2.1 (CDN) |
| **Backend** | Google Apps Script Web App (`doPost` / `doGet`) |
| **Database** | Google Sheets (auto-created tabs per competition) |
| **Hosting** | GitHub Pages |
| **Distribution** | WhatsApp link + QR Code |

---

## 📁 Project Structure

```
JagranEcoFest/
├── index.html                 ← Single-page frontend (HTML + inlined CSS & JS references)
├── css/
│   └── style.css              ← All stylesheets (design system, components, animations)
├── js/
│   ├── script.js              ← Core application logic (navigation, validation, API calls)
│   └── animations.js          ← Anime.js animations, transitions, micro-interactions
├── backend/
│   └── Code.gs                ← Google Apps Script (Web App backend)
├── docs/
│   ├── PRD.md                 ← Product Requirements Document
│   └── implementation_plan.md ← Step-by-step build plan
├── assets/
│   └── qr-placeholder.png     ← Placeholder for QR code image
├── README.md                  ← This file — setup & deployment guide
└── CLAUDE.md                  ← AI agent reference guide (project conventions)
```

---

## ⚙️ Setup: Google Apps Script

> ⚠️ **Do this first.** The app will not function until the backend is deployed.

1. Create a **new Google Sheet** at [sheets.new](https://sheets.new)
2. Click **Extensions → Apps Script**
3. Delete any default code in the editor
4. Open `backend/Code.gs` from this project — copy the **entire contents** and paste into the Apps Script editor
5. Click **Deploy → New Deployment**
6. Configure:
   - **Type:** Web App
   - **Execute as:** Me *(your Google account)*
   - **Who has access:** Anyone
7. Click **Deploy** — review and accept permissions when prompted
8. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/.../exec`)
9. Open `js/script.js` — locate this line near the top:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
   ```
10. Replace the existing URL with your copied URL
11. **Save** `script.js`

> ✅ **Done.** The backend is ready to receive registrations.

---

## 🚀 Deploy to GitHub Pages

### 1. Create GitHub Repository
- Repository name: **`JagranEcoFest`** (must be **Public**)
- Do **not** initialize with README, .gitignore, or license

### 2. Push Project Files
```bash
git init
git add .
git commit -m "Initial commit — JagranEcoFest v1.0"
git branch -M main
git remote add origin https://github.com/[your-username]/JagranEcoFest.git
git push -u origin main
```

### 3. Enable GitHub Pages
1. Go to your repository on GitHub
2. **Settings → Pages**
3. Under **Branch**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**
5. Wait **60–90 seconds** for the first deployment
6. Visit:
   ```
   https://[your-username].github.io/JagranEcoFest
   ```

---

## 📱 Distribution

### WhatsApp Message Template
Copy and share this in class groups:

```
🌿 *World Environment Day 2026 — Registration Open!*

Jagran College of Arts, Science and Commerce

Register for:
🎨 Poster & Slogan Making Competition
🧠 Quiz Competition

👉 Register here: https://[your-username].github.io/JagranEcoFest

⏰ Last date to register: *30 May 2026*
📅 Event date: *5th June 2026*
```

### QR Code (Notice Board / Posters)
1. Visit [qr.io](https://qr.io) or [QR Code Generator](https://www.qr-code-generator.com)
2. Paste your GitHub Pages URL
3. Download as **PNG**
4. Print and display on the college notice board and event posters

---

## 📊 Google Sheets — Data Structure

When the first registration is submitted, the Apps Script automatically creates **up to 4 tabs** in your Google Sheet:

### Master Sheet: `JagranEcoFest`
| Column | Header | Description |
|--------|--------|-------------|
| A | Timestamp | Auto-filled on submission |
| B | Name | Student's full name |
| C | Batch | Class / batch (e.g., BCA 3rd Year) |
| D | Competition | Poster & Slogan Making / Quiz Competition / Both Competitions |
| E | Team Name | Quiz team name (blank for Poster) |
| F | Member 2 Name | Quiz team member 2 |
| G | Member 2 Batch | Quiz team member 2 batch |
| H | Member 3 Name | Quiz team member 3 (optional) |
| I | Member 3 Batch | Quiz team member 3 batch (optional) |

> **Note:** Team members (Member 2, Member 3) are also saved as **separate rows** in the Master Sheet so they can be identified if they open the app later.

### Event-Specific Sheets (auto-created)
- **Poster & Slogan Making** — 5 columns (Timestamp, Name, Batch, Competition, Team Name)
- **Quiz Competition** — 9 columns (same as Master)
- **Both Competitions** — 9 columns (same as Master)

### Access
- **Kanika Mam (NSS Teacher)** is the sole authorized viewer
- Share the Google Sheet with **view-only** or **comment** access to her Google account

---

## 📋 App Screens

| Screen | ID | Description |
|--------|-----|-------------|
| **Welcome** | `s1` | Hero landing with event details, "Get Started" CTA |
| **Choose Competition** | `s2` | Select Poster & Slogan, Quiz, or Both (with rule sheets) |
| **Your Details** | `s3` | Name + Batch input with duplicate check |
| **Team Setup** | `s4` | Quiz team formation (2–3 members, visible only for Quiz/Both) |
| **Review & Submit** | `s5` | Summary card with edit options, submit via POST |
| **Success** | `s6` | Confirmation card with timestamp + pass download |
| **Already Registered** | `sx` | Shown when name + batch already exist in sheet |
| **Added as Team Member** | `sy` | Shown when name + batch found as a team member |

---

## ❗ Troubleshooting

| Issue | Likely Cause | Solution |
|-------|-------------|----------|
| Registrations not saving | Apps Script URL not configured | Check `APPS_SCRIPT_URL` in `js/script.js` |
| "Something went wrong" on submit | Web App access set to "Only me" | Re-deploy with **Anyone** access |
| Google Sheet not creating tabs | First registration not submitted yet | Submit a test registration |
| Duplicate check not working | GET endpoint not deployed | Ensure `doGet` is present in `Code.gs` |
| Page not loading on GitHub Pages | DNS propagation delay | Wait 2–3 minutes, then hard refresh (Ctrl+Shift+R) |
| PDF pass not generating | html2canvas/jspDF blocked by CSP | Ensure CDN URLs are accessible |

---

## 🧪 Quality Checklist

Before final deployment, verify:

- [ ] All 9 screens render without JavaScript errors
- [ ] Form validation works on all inputs
- [ ] GET duplicate check returns correct status (`already_registered`, `added_as_member`, `new_user`)
- [ ] POST submits to correct sheet and returns `{ status: "success" }`
- [ ] Confirmation card displays all submitted data correctly
- [ ] Bottom sheet (rules) opens/closes smoothly
- [ ] Error toast appears on network failure with retry option
- [ ] "Download Pass" generates a centered PDF on A4
- [ ] Mobile responsive — no horizontal scroll, 48px minimum touch targets
- [ ] All text is readable with sufficient color contrast

---

## 🔐 Security Notes

- No sensitive student data (passwords, emails, phone numbers) is stored
- No localStorage or sessionStorage is used — all state is in-memory only
- Google Apps Script enforces CORS — only authorized requests are processed
- Sheet access is restricted to the NSS Teacher's Google account only

---

## 👤 Credits

| Role | Name |
|------|------|
| **Developer** | Ayush Gupta — BCA 3rd Year |
| **Contact** | 7390841128 |
| **NSS Teacher** | Kanika Mam (Sheet Access Only) |
| **Institution** | Jagran College of Arts, Science and Commerce |

---

*JagranEcoFest v1.0 — Built for World Environment Day 2026 | May 2026*
