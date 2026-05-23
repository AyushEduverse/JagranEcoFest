# CLAUDE.md — JagranEcoFest Agent Guide
> This file is the single source of truth for any AI agent building this project.
> Read this COMPLETELY before writing a single line of code.

---

## 0. FIRST THING — READ ALL SKILLS

Before doing anything else, read every skill file at:
```
C:\Users\ayush\.openclaude\skills\
```

Run this to list them:
```bash
dir C:\Users\ayush\.openclaude\skills\
```

Then read each SKILL.md found. Skills override your defaults.
Specifically look for and prioritize:
- `frontend-design` or `web-design` skill → governs all UI/CSS decisions
- `html-css-js` or `vanilla-js` skill → governs code patterns
- Any `google-apps-script` or `backend` skill → governs backend code
- Any `github-pages` or `deployment` skill → governs deployment steps

If a skill conflicts with instructions here, **skill wins**.
If no relevant skill exists, follow instructions in this file exactly.

---

## 1. PROJECT IDENTITY

| Key | Value |
|---|---|
| Project Name | JagranEcoFest |
| Type | Mobile-first multi-step event registration web app |
| Event | World Environment Day 2026 — 5th June |
| College | Jagran College of Arts, Science and Commerce |
| Built By | Ayush Gupta, BCA 3rd Year, 7390841128 |
| Repo | JagranEcoFest (GitHub) |
| Hosting | GitHub Pages |
| Distribution | WhatsApp link + QR Code |
| Backend | Google Apps Script → Google Sheets |
| Sheet Access | Kanika Mam (NSS Teacher) only |

---

## 2. TECH STACK — NON-NEGOTIABLE

```
Frontend  : Single index.html file — HTML5 + CSS3 + Vanilla JavaScript
            NO React. NO Vue. NO framework. NO build step.
            ONE FILE ONLY → index.html
Icons     : Font Awesome 6 Free CDN (solid style)
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
Fonts     : Google Fonts — Playfair Display + DM Sans
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
Backend   : Google Apps Script (Web App)
            Separate file → Code.gs
            Endpoints: doPost() for submit, doGet() for status check
Storage   : Google Sheets via Apps Script appendRow() / getValues()
Hosting   : GitHub Pages → index.html in root
```

---

## 3. FILE STRUCTURE TO CREATE

```
JagranEcoFest/
├── index.html          ← entire frontend (HTML + CSS + JS in one file)
├── Code.gs             ← Google Apps Script backend code
├── README.md           ← setup instructions for Ayush
├── CLAUDE.md           ← this file (copy here too)
└── assets/
    └── qr-placeholder.png  ← placeholder, real QR generated after deploy
```

---

## 4. DESIGN SYSTEM — IMPLEMENT EXACTLY

### CSS Variables (define in :root)
```css
:root {
  --bg:           #F5F0E8;  /* warm cream — page background */
  --primary:      #2D5A27;  /* deep forest green — buttons, headers */
  --secondary:    #8B6914;  /* golden brown — labels, borders */
  --accent:       #C4874A;  /* terracotta — chips, highlights */
  --dark:         #1A2F18;  /* very dark green — hero bg */
  --surface:      #E8F5E3;  /* light sage — card bg */
  --text:         #2C1810;  /* dark brown — body text */
  --amber:        #D4A017;  /* amber — already registered screen */
  --error:        #C0392B;  /* red — error states only */
  --white:        #FFFFFF;
  --shadow:       rgba(45, 90, 39, 0.10);  /* warm green shadow */
  --radius-input: 12px;
  --radius-card:  20px;
  --radius-btn:   16px;
  --radius-pill:  99px;
}
```

### Typography Rules
```css
/* Display / Headings */
font-family: 'Playfair Display', serif;
/* Body / Inputs / Buttons */
font-family: 'DM Sans', sans-serif;

/* Sizes */
--fs-hero:    32px;   /* Screen 1 title */
--fs-title:   24px;   /* Screen titles */
--fs-card:    18px;   /* Card titles */
--fs-body:    15px;   /* Body copy */
--fs-label:   13px;   /* Labels, captions */
--fs-btn:     16px;   /* Button text */
--fs-input:   16px;   /* Input text — never below 16px on mobile */
```

### Spacing (8px base grid)
```
8px  → xs (tight spacing)
16px → sm (between elements)
24px → md (section padding)
32px → lg (screen padding top)
48px → xl (hero sections)
```

---

## 5. SCREENS TO BUILD — COMPLETE LIST

| ID | Screen | Trigger |
|---|---|---|
| S1 | Welcome / Landing | App opens |
| S2 | Choose Competition | After phone entered |
| S3 | Your Details | After competition selected |
| S4 | Team Setup | Only if Quiz or Both selected |
| S5 | Review & Submit | After details filled |
| S6 | Success + Confirmation Card | After successful POST |
| SX | Already Registered | Name+Batch match found in Sheet |
| SY | Added as Team Member | Name+Batch found as team member in Sheet |
| SE | Error State | POST fails / network error |

---

## 6. COMPLETE SCREEN SPECIFICATIONS

### S1 — Welcome / Landing

**On "Get Started" tap:**
1. Navigate to S2

**Layout:**
- Hero: full-width, bg `var(--dark)`, min-height 55vh
- Leaf SVG pattern overlay at 8% opacity on hero
- `fa-leaf` icon 48px color `var(--accent)` centered
- Title: "World Environment Day 2026" — Playfair Display 32px white
- Date badge pill: "5th June 2026" bg `var(--accent)` white text
- Tagline: "Celebrate. Create. Conserve." italic Playfair 16px white 80%
- CSS clip-path wave divider into cream section below
- Bottom section bg `var(--bg)` padding 24px:
  - Deadline chip "📅 Last date: 30 May 2026" amber bg
  - Primary CTA: "Get Started →"

---

### S2 — Choose Competition
**Progress:** Step 1 of 4, bar 25%

**3 tap cards:**
| Value | Icon | Title | Subtitle |
|---|---|---|---|
| `poster` | fa-palette | Poster & Slogan Making | Individual entry |
| `quiz` | fa-brain | Quiz Competition | Team of 2–3 students |
| `both` | fa-star | Both Competitions | Enter both events |

**Each card has:**
- "View Rules" button → opens bottom sheet (non-blocking)
- Selected state: border 2px `var(--primary)`, bg `var(--surface)`, `fa-circle-check` top-right
- Unselected: border 1.5px `#D9C8B0`, bg white

**Store:** `appState.competition = 'poster' | 'quiz' | 'both'`

**Skip S4** if competition === 'poster'

---

### S3 — Your Details
**Progress:** Step 2 of 4, bar 50%

**Fields:**
| Field | Key | Icon | Validation |
|---|---|---|---|
| Full Name | `appState.name` | fa-user | Required, min 3 chars, letters+spaces |
| Batch | `appState.batch` | fa-graduation-cap | Required, min 2 chars |

**On Continue:**
1. Validate both fields
2. Call GET endpoint: `?name={name}&batch={batch}&phone={phone}`
3. If response `already_registered` → navigate to SX
4. If response `added_as_member` → navigate to SY
5. If response `new_user` → navigate to S4 (if quiz/both) or S5 (if poster)

**Show loading spinner** while GET is in flight. Disable button.

---

### S4 — Team Setup *(Quiz / Both only)*
**Progress:** Step 3 of 4, bar 75%

**Fields:**
| Field | Key | Icon | Required |
|---|---|---|---|
| Team Name | `appState.teamName` | fa-shield | Yes |
| Member 2 Name | `appState.m2name` | fa-user | Yes |
| Member 2 Batch | `appState.m2batch` | fa-graduation-cap | Yes |
| Member 3 Name | `appState.m3name` | fa-user | No |
| Member 3 Batch | `appState.m3batch` | fa-graduation-cap | No (required if m3name filled) |

**Member 1 card** = auto-filled from `appState.name` + `appState.batch`. Read-only. Shows `fa-crown` icon + "Captain" badge.

**Member 3:** Hidden by default. `fa-user-plus` "+ Add 3rd Member" ghost button reveals it. `fa-trash` "Remove" link hides + clears it.

**Validation:**
- Team name required
- M2 name + batch both required
- M3: if either field has value, both must be filled

---

### S5 — Review & Submit
**Progress:** Step 4 of 4, bar 100%

**Shows summary cards:**
1. Competition badge chip (colored by type)
2. "Your Details" card: Name, Batch, Phone + Edit button
3. "Team" card (if quiz/both): Team name + members + Edit button
4. Deadline reminder amber chip

**On "Submit Entry":**
1. Show loading state (spinner, disable button)
2. POST to Apps Script URL:
```json
{
  "name": "",
  "batch": "",
  "phone": "",
  "competition": "",
  "teamName": "",
  "m2name": "",
  "m2batch": "",
  "m3name": "",
  "m3batch": ""
}
```
3. Success → navigate to S6
4. Fail → show error toast SE, re-enable button

**Edit buttons** navigate back to S3 or S4, preserving all state.

---

### S6 — Success + Confirmation Card
**No nav bar. Terminal screen.**

**Top hero section** bg `var(--primary)` 35vh:
- `fa-circle-check` 64px white, CSS scale-in animation
- "You're In! 🌿" — 28px Playfair white
- "See you on 5th June 2026" — 14px DM Sans white 80%

**CSS wave** into white card area below.

**Confirmation Card** (id="confirmCard" — used for screenshot):
- White bg, border-radius 20px
- Top color band: 8px solid `var(--primary)`
- Leaf SVG watermark bottom-right, 8% opacity
- Rows: Name / Batch / Phone / Competition / Team (if quiz)
- Dashed `var(--accent)` divider
- Footer: "✅ Entry Confirmed" + timestamp

**Buttons:**
- "📸 Save / Screenshot this card" (fa-camera) → `window.print()` or share sheet hint
- "Register another student" (fa-rotate-left) → `resetApp()`

---

### SX — Already Registered
**No nav bar. Special state.**

**Top hero** bg `var(--amber)`:
- `fa-circle-check` 56px white
- "You're Already Registered! 🌿" — 26px Playfair white
- "No need to register again." — 14px white 80%

**Card** (amber top band):
- Show all details returned from GET response
- Same confirmation card layout as S6
- "📸 Save this card" button

---

### SY — Added as Team Member
**No nav bar. Special state.**

**Top hero** bg `var(--primary)`:
- `fa-users` 56px white
- "You're Part of the Team! 🌿" — 26px Playfair white
- "[captainName] has already added you" — 14px white 80%

**Team card:**
- Member name, batch, team name, captain name, competition
- "✅ Registered via your team"

**Event details card** (sage bg):
- 📅 5th June 2026
- 🏫 Jagran College
- 🧠 Quiz — 3 Rounds, Rapid Fire Buzzer
- ⏰ Already registered!

**Buttons:**
- "📸 Save this card"
- "View Quiz Rules →" ghost button → opens quiz rules bottom sheet

---

### SE — Error Toast
**Slides up from bottom, auto-dismiss 5 seconds:**
- bg `var(--error)` white text
- `fa-triangle-exclamation` icon
- "Something went wrong. Check your connection and retry."
- "Retry" link re-enables submit button

---

## 7. GLOBAL COMPONENT SPECS

### Input Field
```html
<div class="input-group">
  <label>Full Name</label>
  <div class="input-wrapper">
    <i class="fa-solid fa-user input-icon"></i>
    <input type="text" placeholder="e.g. Ayush Gupta" />
  </div>
  <span class="input-error hidden">Error message here</span>
</div>
```
```css
.input-wrapper {
  border: 1.5px solid var(--accent);
  border-radius: var(--radius-input);
  padding: 14px 16px 14px 44px;  /* left padding for icon */
  position: relative;
}
.input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(45,90,39,0.12);
}
```

### Primary Button
```css
.btn-primary {
  background: var(--primary);
  color: white;
  border-radius: var(--radius-btn);
  height: 56px;
  width: 100%;
  font: 600 16px/1 'DM Sans', sans-serif;
  border: none;
  transition: transform 0.1s, background 0.2s;
}
.btn-primary:active { transform: scale(0.97); background: var(--dark); }
.btn-primary:disabled { background: #A8C5A0; cursor: not-allowed; }
```

### Card Component
```css
.card {
  background: var(--surface);
  border-radius: var(--radius-card);
  box-shadow: 0 4px 16px var(--shadow);
  padding: 20px;
}
.card-accent {
  border-left: 4px solid var(--primary);
}
```

### Progress Bar
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 25%"></div>
</div>
```
```css
.progress-bar { height: 6px; background: #D9D9D9; border-radius: 99px; }
.progress-fill { height: 100%; background: var(--primary); border-radius: 99px; transition: width 0.4s ease; }
```

### Bottom Sheet (Rules)
```html
<div class="sheet-backdrop" onclick="closeSheet()"></div>
<div class="bottom-sheet" id="rulesSheet">
  <div class="sheet-handle"></div>
  <h3 class="sheet-title">Poster Rules</h3>
  <div class="sheet-content"><!-- rules content --></div>
</div>
```
```css
.bottom-sheet {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--bg); border-radius: 24px 24px 0 0;
  padding: 16px 24px 40px;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  z-index: 100; max-height: 75vh; overflow-y: auto;
}
.bottom-sheet.open { transform: translateY(0); }
.sheet-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  z-index: 99;
  display: none;
}
.sheet-backdrop.visible { display: block; }
```

---

## 8. STATE MANAGEMENT

Use a single global object. Never use `localStorage`.

```javascript
const appState = {
  // Screen 1
  phone: '',
  // Screen 2
  competition: '',       // 'poster' | 'quiz' | 'both'
  // Screen 3
  name: '',
  batch: '',
  // Screen 4 (quiz/both only)
  teamName: '',
  m2name: '', m2batch: '',
  m3name: '', m3batch: '',
  // Internal
  currentScreen: 's1',
  isLoading: false,
};

function navigate(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  appState.currentScreen = screenId;
  window.scrollTo(0, 0);
}

function resetApp() {
  Object.assign(appState, { phone:'', competition:'', name:'', batch:'',
    teamName:'', m2name:'', m2batch:'', m3name:'', m3batch:'',
    currentScreen:'s1', isLoading:false });
  navigate('s1');
  // clear all inputs
  document.querySelectorAll('input').forEach(i => i.value = '');
}
```

---

## 9. GOOGLE APPS SCRIPT — Code.gs

```javascript
const SHEET_NAME = 'Registrations';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.batch || '',
      data.phone || '',
      data.competition || '',
      data.teamName || '',
      data.m2name || '',
      data.m2batch || '',
      data.m3name || '',
      data.m3batch || ''
    ]);
    return jsonResponse({ status: 'success' });
  } catch(err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  try {
    const name  = (e.parameter.name  || '').toLowerCase().trim();
    const batch = (e.parameter.batch || '').toLowerCase().trim();
    const phone = (e.parameter.phone || '').trim();

    const sheet = getOrCreateSheet();
    const rows  = sheet.getDataRange().getValues();

    // Skip header row (row 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rName  = String(row[1] || '').toLowerCase().trim();
      const rBatch = String(row[2] || '').toLowerCase().trim();
      const rPhone = String(row[3] || '').trim();

      // Check if this is the main registrant
      // Priority: Name match → Batch match → Phone tiebreaker
      if (rName === name) {
        if (rBatch === batch) {
          // Confirmed duplicate registrant
          return jsonResponse({
            status: 'already_registered',
            data: {
              name: row[1], batch: row[2], phone: row[3],
              competition: row[4], teamName: row[5],
              timestamp: row[0]
            }
          });
        }
        // Name matches but batch differs → different person, continue
      }

      // Check if name+batch appear as team member (cols 6-9)
      const m2name  = String(row[6] || '').toLowerCase().trim();
      const m2batch = String(row[7] || '').toLowerCase().trim();
      const m3name  = String(row[8] || '').toLowerCase().trim();
      const m3batch = String(row[9] || '').toLowerCase().trim();

      if ((m2name === name && m2batch === batch) ||
          (m3name === name && m3batch === batch)) {
        return jsonResponse({
          status: 'added_as_member',
          data: {
            memberName: (m2name === name) ? row[6] : row[8],
            memberBatch: (m2batch === batch) ? row[7] : row[9],
            teamName: row[5],
            captainName: row[1],
            captainBatch: row[2],
            competition: row[4]
          }
        });
      }
    }

    return jsonResponse({ status: 'new_user' });

  } catch(err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Timestamp','Name','Batch','Phone','Competition',
      'Team Name','Member 2 Name','Member 2 Batch',
      'Member 3 Name','Member 3 Batch'
    ]);
    // Bold header row
    sheet.getRange(1,1,1,10).setFontWeight('bold').setBackground('#2D5A27').setFontColor('#FFFFFF');
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Deploy Settings:**
- Execute as: **Me**
- Who has access: **Anyone** (required for fetch to work)

---

## 10. FETCH CALLS IN FRONTEND

```javascript
// Replace this with actual deployed URL after Apps Script deployment
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

// GET — check status
async function checkRegistrationStatus(name, batch, phone) {
  const url = `${APPS_SCRIPT_URL}?name=${encodeURIComponent(name)}&batch=${encodeURIComponent(batch)}&phone=${encodeURIComponent(phone)}`;
  const res = await fetch(url);
  return await res.json();
}

// POST — submit registration
async function submitRegistration(data) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}
```

**Note on CORS:** Google Apps Script handles CORS automatically when deployed as Web App with "Anyone" access. No proxy needed.

---

## 11. LEAF SVG PATTERN (use in hero bg)

```html
<!-- Inline SVG leaf — use as background-image or overlay -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.08">
  <path d="M50 10 C20 10, 5 40, 10 70 C30 50, 70 50, 90 70 C95 40, 80 10, 50 10Z"
        fill="#FFFFFF"/>
</svg>
```

Or use CSS background pattern:
```css
.hero {
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(196,135,74,0.15) 0%, transparent 60%),
    url("data:image/svg+xml,...leaf svg encoded...");
}
```

---

## 12. ANIMATIONS

```css
/* Scale-in for success checkmark */
@keyframes scaleIn {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.success-icon { animation: scaleIn 0.5s ease forwards; }

/* Slide up for screens */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.screen.active { animation: slideUp 0.3s ease; }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.fa-spin { animation: spin 0.8s linear infinite; }

/* Toast slide up */
@keyframes toastIn {
  from { transform: translateY(100px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.toast { animation: toastIn 0.3s ease; }
```

---

## 13. MOBILE CONSTRAINTS — ENFORCE ALL

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

```css
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body { max-width: 430px; margin: 0 auto; min-height: 100vh; overflow-x: hidden; }
input, select, textarea { font-size: 16px !important; }  /* prevent iOS zoom */
.btn-primary { min-height: 56px; }   /* touch target */
.tap-target { min-height: 48px; min-width: 48px; }
```

---

## 14. QUALITY CHECKLIST

Run through this before considering the build complete:

### Functionality
- [ ] All 9 screens render without errors
- [ ] Phone validation: 10 digits only
- [ ] Name + Batch validation on S3
- [ ] GET call fires after S3 Continue, shows loading state
- [ ] SX renders correctly with data from Sheet
- [ ] SY renders correctly with team data from Sheet
- [ ] S4 shows only for quiz/both, skips for poster
- [ ] Member 3 add/remove works correctly
- [ ] M3 partial fill validation (both or neither)
- [ ] POST call fires on S5 Submit
- [ ] S6 confirmation card shows correct data
- [ ] Error toast shows on network fail
- [ ] Edit buttons navigate back preserving state
- [ ] Reset clears all state and inputs
- [ ] Progress bar updates per screen

### Design
- [ ] CSS variables used everywhere (no hardcoded colors)
- [ ] Playfair Display on all headings
- [ ] DM Sans on all body/inputs/buttons
- [ ] Font Awesome icons loaded and visible
- [ ] Wave/curve divider on S1 hero
- [ ] Bottom sheet opens/closes smoothly
- [ ] Cards have correct border-radius and shadow
- [ ] Input focus state shows green ring
- [ ] Buttons have press/active state
- [ ] No horizontal scroll on any screen
- [ ] Touch targets ≥ 48px

### Backend (Code.gs)
- [ ] doPost writes correct 10 columns to Sheet
- [ ] doGet checks name → batch → phone logic correctly
- [ ] already_registered returns full row data
- [ ] added_as_member returns captain + team data
- [ ] new_user returned when no match
- [ ] Header row created with green styling on first run
- [ ] No crashes on empty/null fields

### README.md must include
- [ ] How to deploy Code.gs as Web App
- [ ] Where to paste the Web App URL in index.html
- [ ] How to push to GitHub and enable Pages
- [ ] How to generate QR code from GitHub Pages URL
- [ ] How to share WhatsApp link

---

## 15. DO NOT DO THESE

- ❌ Do NOT use React, Vue, Angular, or any framework
- ❌ Do NOT use localStorage or sessionStorage
- ❌ Do NOT hardcode colors — always use CSS variables
- ❌ Do NOT use Inter, Roboto, or Arial fonts
- ❌ Do NOT create multiple HTML files — everything in index.html
- ❌ Do NOT use purple gradients or generic AI design patterns
- ❌ Do NOT skip the leaf/nature visual elements
- ❌ Do NOT forget `font-size: 16px` on inputs (causes iOS zoom)
- ❌ Do NOT use `WidthType.PERCENTAGE` in any table (N/A here but noted)
- ❌ Do NOT make the app work without the Apps Script URL configured

---

## 16. README.md CONTENT TO GENERATE

The README must contain these sections:
1. **Project Overview** — one paragraph
2. **Live URL** — placeholder for GitHub Pages link
3. **Setup: Google Apps Script**
   - Step 1: Open Google Sheets, go to Extensions → Apps Script
   - Step 2: Paste Code.gs contents
   - Step 3: Deploy → New Deployment → Web App → Execute as Me → Anyone
   - Step 4: Copy Web App URL
   - Step 5: Paste URL into `index.html` at `const APPS_SCRIPT_URL = '...'`
4. **Setup: GitHub Pages**
   - Push to GitHub repo named `JagranEcoFest`
   - Settings → Pages → Source: main branch, root folder
   - Wait ~60 seconds for URL to go live
5. **QR Code Generation**
   - Use https://qr.io or https://www.qr-code-generator.com
   - Paste the GitHub Pages URL
   - Download PNG for printing
6. **WhatsApp Distribution**
   - Message template to send

---

*CLAUDE.md v1.0 — JagranEcoFest — Created by Ayush Gupta, BCA 3rd Year*

