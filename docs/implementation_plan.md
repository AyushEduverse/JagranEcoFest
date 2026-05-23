# JagranEcoFest — Implementation Plan
> Step-by-step build plan for the agent. Follow phases in order. Do not skip.

---

## Phase Overview

```
Phase 0 → Read skills + Setup repo structure
Phase 1 → Google Apps Script backend (Code.gs)
Phase 2 → HTML skeleton + CSS design system
Phase 3 → Screen 1: Welcome
Phase 4 → Screen 2: Choose Competition + Bottom Sheet
Phase 5 → Screen 3: Your Details + GET check
Phase 6 → Screen 4: Team Setup
Phase 7 → Screen 5: Review & Submit + POST
Phase 8 → Screen 6: Success Card
Phase 9 → Screen X: Already Registered
Phase 10 → Screen Y: Added as Team Member
Phase 11 → Error Toast + Loading States
Phase 12 → Animations + Polish
Phase 13 → README.md
Phase 14 → Quality checklist + Final review
```

---

## Phase 0 — Read Skills + Setup

**Tasks:**
- [ ] Read all files in `C:\Users\ayush\.openclaude\skills\`
- [ ] Note any skill that overrides defaults in CLAUDE.md
- [ ] Create repo folder: `JagranEcoFest/`
- [ ] Create empty `index.html`, `Code.gs`, `README.md`
- [ ] Create `assets/` folder

**Output:**
```
JagranEcoFest/
├── index.html      (empty shell)
├── Code.gs         (empty)
├── README.md       (empty)
└── assets/
```

**Gate:** Folder exists, all files created → proceed to Phase 1.

---

## Phase 1 — Backend: Code.gs

**Tasks:**
- [ ] Write `doPost(e)` function — appends 10 columns to Sheet
- [ ] Write `doGet(e)` function — Name → Batch → Phone lookup logic
- [ ] Write `getOrCreateSheet()` — auto-creates header row with green styling
- [ ] Write `jsonResponse(obj)` helper
- [ ] Test logic mentally: trace through each response case

**Duplicate check logic to implement:**
```
Input: name, batch
For each row in Sheet (skip header):
  1. Does rName === name?
     YES → Does rBatch === batch?
            YES → return already_registered (with row data)
            NO  → continue (different person, same name)
  2. Does (m2name===name && m2batch===batch) OR (m3name===name && m3batch===batch)?
     YES → return added_as_member (with team data)
  3. No match found → return new_user
```

**Sheet columns (exact order):**
```
A: Timestamp  B: Name  C: Batch  D: Competition
E: Team Name  F: M2 Name  G: M2 Batch  H: M3 Name  I: M3 Batch
```

**Gate:** Code.gs is logically correct, all 3 response types handled → proceed.

---

## Phase 2 — HTML Skeleton + CSS Design System

**Tasks:**
- [ ] Write HTML boilerplate with viewport meta tag
- [ ] Link Font Awesome 6 CDN
- [ ] Link Google Fonts (Playfair Display + DM Sans)
- [ ] Define all CSS variables in `:root`
- [ ] Write global reset + base styles
- [ ] Write `.screen` class (hidden by default, `.active` shows)
- [ ] Write all global component CSS:
  - Input group + wrapper + icon + focus state + error state
  - Primary button (normal + disabled + loading states)
  - Secondary/ghost button
  - Card component + card-accent variant
  - Progress bar
  - Bottom sheet + backdrop
  - Toast/snackbar
  - Confirmation card (with top band + leaf watermark + dashed divider)
  - Chip/badge/pill
  - Top nav bar
- [ ] Write `appState` object
- [ ] Write `navigate()` function
- [ ] Write `resetApp()` function
- [ ] Create 9 empty screen divs with IDs: s1, s2, s3, s4, s5, s6, sx, sy, se

**Gate:** Open index.html in browser. Should show blank cream page, no errors in console. All CSS variables loaded. → proceed.

---

## Phase 3 — Screen 1: Welcome

**Tasks:**
- [ ] Build hero section (dark green bg, leaf pattern, `fa-leaf` icon)
- [ ] Add college name (small, white, top)
- [ ] Add event title (Playfair 32px white)
- [ ] Add date badge pill (terracotta)
- [ ] Add tagline (italic white 80%)
- [ ] Add CSS wave divider (`clip-path` or SVG wave)
- [ ] Build bottom section (cream bg)
- [ ] Add deadline chip (amber)
- [ ] Add "Get Started" primary button
- [ ] Write `startApp()` JS function:
  - Call `navigate('s2')`
- [ ] Test: goes to S2.

**Gate:** S1 renders beautifully, wave visible, navigation works → proceed.

---

## Phase 4 — Screen 2: Choose Competition + Bottom Sheet

**Tasks:**
- [ ] Build top nav with back arrow + step label "Step 1 of 4"
- [ ] Build progress bar at 25%
- [ ] Add screen title + subtitle
- [ ] Build 3 competition tap cards (stacked)
- [ ] Each card: icon + title + subtitle + "View Rules" button
- [ ] Selected state: green border + checkmark, unselected: grey border
- [ ] Allow only one card selected at a time
- [ ] Store `appState.competition` on tap
- [ ] Build bottom sheet HTML (poster rules + quiz rules as two sheets)
- [ ] Write `openSheet(type)` and `closeSheet()` JS functions
- [ ] "View Rules" buttons open correct sheet (non-blocking — don't require closing)
- [ ] Sticky "Continue →" button at bottom
- [ ] Validate: card must be selected to continue
- [ ] On continue: `navigate('s3')`

**Gate:** All 3 cards selectable, both rule sheets open/close, continue navigates to S3 → proceed.

---

## Phase 5 — Screen 3: Your Details + GET Check

**Tasks:**
- [ ] Build top nav "Step 2 of 4" with back to S2
- [ ] Progress bar at 50%
- [ ] Build Name input (fa-user, validation)
- [ ] Build Batch input (fa-graduation-cap, validation)
- [ ] "Continue →" button
- [ ] Write `continueFromS3()` JS function:
  - Validate name (required, ≥3 chars)
  - Validate batch (required)
  - Store to appState
  - Show loading spinner on button
  - Call `checkRegistrationStatus(name, batch)`
  - On `already_registered` → populate SX data → `navigate('sx')`
  - On `added_as_member` → populate SY data → `navigate('sy')`
  - On `new_user` → `navigate(appState.competition === 'poster' ? 's5' : 's4')`
  - On error → show toast
  - Always re-enable button after response
- [ ] Test all 3 GET response paths with mock data (temporarily hardcode response)

**Gate:** Name+batch validated, GET fires, all 3 paths navigate correctly → proceed.

---

## Phase 6 — Screen 4: Team Setup

**Tasks:**
- [ ] Build top nav "Step 3 of 4" with back to S3
- [ ] Progress bar at 75%
- [ ] Build Team Name input (fa-shield)
- [ ] Build "Team Members" section label
- [ ] Build Member 1 read-only card:
  - Shows appState.name + appState.batch
  - `fa-crown` amber icon + "Captain" pill badge
  - Light sage bg, elevated appearance
- [ ] Build Member 2 card:
  - Name input (fa-user) + Batch input (fa-graduation-cap)
  - White bg card
- [ ] Build "+ Add 3rd Member" ghost dashed button (fa-user-plus)
- [ ] Build Member 3 card (hidden by default):
  - Same as M2 but with "Remove" fa-trash link top-right
  - Appears/disappears with CSS transition
- [ ] Write `toggleMember3()` JS function
- [ ] "Continue →" sticky button
- [ ] Write `continueFromS4()` validation:
  - Team name required
  - M2 name + batch required
  - M3: if either field filled → both required
  - Store all to appState
  - Navigate to 's5'

**Gate:** Team form works, M3 toggle works, validation correct, data stored → proceed.

---

## Phase 7 — Screen 5: Review & Submit + POST

**Tasks:**
- [ ] Build top nav "Step 4 of 4" with back to S4 (or S3 if poster)
- [ ] Progress bar at 100%
- [ ] Screen title "Review your entry"
- [ ] Competition badge chip (colors: poster=terracotta, quiz=primary, both=amber)
- [ ] Build "Your Details" summary card:
  - Rows: Name / Batch
  - Edit (fa-pen) button → navigate to s3 preserving state
- [ ] Build "Team" summary card (show only if quiz/both):
  - Team name bold
  - Member rows with fa-crown (M1) and fa-user (M2, M3)
  - Edit (fa-pen) → navigate to s4
- [ ] Deadline reminder chip (amber, fa-clock icon)
- [ ] "Submit Entry" primary button (fa-paper-plane icon)
- [ ] Write `submitEntry()` JS function:
  - Disable button, show `fa-spinner fa-spin` + "Submitting…"
  - Build JSON payload from appState
  - POST to APPS_SCRIPT_URL
  - Success: populate S6 card → navigate('s6')
  - Fail: show error toast, re-enable button
- [ ] Test with real Apps Script URL

**Gate:** All data shows correctly, POST sends correct JSON, S6 navigates on success → proceed.

---

## Phase 8 — Screen 6: Success + Confirmation Card

**Tasks:**
- [ ] Build top hero (primary green bg, 35vh)
- [ ] `fa-circle-check` 64px white with scaleIn CSS animation
- [ ] "You're In! 🌿" Playfair 28px white
- [ ] Subtext white 80%
- [ ] CSS wave/curve from green hero into white card area
- [ ] Build confirmation card (id="confirmCard"):
  - 8px top band (primary green)
  - Leaf SVG watermark (bottom-right, 8% opacity, absolute positioned)
  - Rows: Name / Batch / Competition / Team (conditional)
  - Dashed terracotta divider
  - "✅ Entry Confirmed" + registration timestamp
- [ ] "📸 Save / Screenshot this card" button:
  - Action: `window.print()` + CSS `@media print { hide everything except #confirmCard }`
- [ ] "Register another student" text link → `resetApp()`
- [ ] Populate card dynamically from appState when navigating here

**Gate:** Card shows all correct data, print hides other elements, reset works → proceed.

---

## Phase 9 — Screen SX: Already Registered

**Tasks:**
- [ ] Build top hero (amber bg `var(--amber)`)
- [ ] `fa-circle-check` 56px white
- [ ] "You're Already Registered! 🌿" Playfair 26px white
- [ ] Subtext white 80%
- [ ] CSS wave into card area
- [ ] Confirmation card (amber top band):
  - Show data returned from GET: name, batch, competition, team, timestamp
  - Same row layout as S6 card
- [ ] "📸 Save this card" button (same print action)
- [ ] No re-registration option
- [ ] Write `populateSX(data)` function — fills card from GET response

**Gate:** SX populates correctly from mock GET data, design distinct from S6 (amber vs green) → proceed.

---

## Phase 10 — Screen SY: Added as Team Member

**Tasks:**
- [ ] Build top hero (primary green bg)
- [ ] `fa-users` 56px white
- [ ] Dynamic headline: "You're Part of the Team! 🌿"
- [ ] Dynamic subtext: "[captainName] has already added you"
- [ ] CSS wave into card area
- [ ] Team confirmation card:
  - Member name, batch, team name, captain name, competition
  - "✅ Registered via your team"
- [ ] Event details card (sage bg):
  - 📅 5th June 2026
  - 🏫 Jagran College of Arts, Science and Commerce
  - 🧠 Quiz Competition — 3 Rounds, Rapid Fire Buzzer
  - ⏰ Registration: Already done!
- [ ] "📸 Save this card" button
- [ ] "View Quiz Rules →" ghost button → opens quiz rules bottom sheet
- [ ] Write `populateSY(data)` function — fills from GET response

**Gate:** SY renders, dynamic captain name shows, quiz rules sheet opens from SY → proceed.

---

## Phase 11 — Error Toast + All Loading States

**Tasks:**
- [ ] Build error toast (fixed bottom, slide-up animation)
- [ ] Write `showToast(message)` and `hideToast()` functions
- [ ] Auto-dismiss toast after 5 seconds
- [ ] Verify all loading states:
  - S3 Continue button: spinner while GET in flight
  - S5 Submit button: spinner + "Submitting…" while POST in flight
  - Both buttons disabled during loading, re-enabled on response
- [ ] Test network error scenario (wrong URL) → toast appears

**Gate:** Toast appears and auto-dismisses, all spinners work, buttons re-enable correctly → proceed.

---

## Phase 12 — Animations + Polish

**Tasks:**
- [ ] Add `slideUp` animation to all screens on `.active`
- [ ] Add `scaleIn` animation to S6 checkmark
- [ ] Add smooth bottom sheet transition (cubic-bezier)
- [ ] Add progress bar width transition (0.4s ease)
- [ ] Add leaf SVG watermark to hero and confirmation cards
- [ ] Verify wave divider looks correct on small screens (360px)
- [ ] Check all touch targets ≥ 48px
- [ ] Check no horizontal overflow on any screen
- [ ] Check inputs don't trigger iOS zoom (font-size ≥ 16px everywhere)
- [ ] Review all screens at 360px, 390px, 430px widths
- [ ] Final color check — no hardcoded colors, all CSS variables

**Gate:** Open in Chrome DevTools mobile simulator. All 9 screens look polished. No layout bugs → proceed.

---

## Phase 13 — README.md

**Write README with these exact sections:**

### 1. Project Overview
One paragraph describing JagranEcoFest.

### 2. 🔗 Live URL
```
https://[your-username].github.io/JagranEcoFest
(replace [your-username] with your GitHub username)
```

### 3. ⚙️ Setup: Google Apps Script (do this first)
Step-by-step numbered instructions:
1. Open Google Sheets (any new sheet)
2. Extensions → Apps Script
3. Delete default code, paste contents of `Code.gs`
4. Click Deploy → New Deployment
5. Type: Web App
6. Execute as: Me
7. Who has access: Anyone
8. Click Deploy → Copy the Web App URL
9. Open `script.js`, find `const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'`
10. Replace with your copied URL
11. Save `script.js`

### 4. 🚀 Deploy to GitHub Pages
1. Create GitHub repo named `JagranEcoFest` (public)
2. Push all files to main branch
3. Go to repo Settings → Pages
4. Source: Deploy from branch → main → / (root)
5. Click Save — wait ~60 seconds
6. Your URL: `https://[username].github.io/JagranEcoFest`

### 5. 📱 Share the App
**WhatsApp message template:**
```
🌿 *World Environment Day 2026 — Registration Open!*

Jagran College of Arts, Science and Commerce

Register for:
🎨 Poster & Slogan Making Competition
🧠 Quiz Competition

👉 Register here: [GitHub Pages URL]

⏰ Last date to register: *30 May 2026*
📅 Event date: *5th June 2026*
```

### 6. 🔲 QR Code (for notice board)
1. Go to https://qr.io
2. Paste your GitHub Pages URL
3. Download PNG
4. Print and display on college notice board

### 7. 📊 View Registrations
- Open the Google Sheet linked to your Apps Script
- All entries appear in the "Registrations" tab
- Share view access with: Kanika Mam (NSS Teacher)

**Gate:** README is complete and clear enough for Ayush to follow independently → proceed.

---

## Phase 14 — Final Quality Checklist

Run every item in the CLAUDE.md Section 14 checklist.

### Critical items to verify end-to-end:
- [ ] Full happy path: S1 → S2 (Quiz) → S3 (new user) → S4 → S5 → POST → S6
- [ ] Poster path: S1 → S2 (Poster) → S3 (new user) → S5 → POST → S6
- [ ] Both path: S1 → S2 (Both) → S3 (new user) → S4 → S5 → POST → S6
- [ ] Duplicate path: S3 → GET returns `already_registered` → SX
- [ ] Member path: S3 → GET returns `added_as_member` → SY
- [ ] Error path: POST fails → toast → retry works
- [ ] Edit path: S5 Edit Details → S3 (data preserved) → back to S5
- [ ] Reset: "Register another student" → clears all, back to S1

### Final deliverable files:
```
JagranEcoFest/
├── index.html          ← complete, production-ready
├── style.css           ← complete styling
├── script.js           ← complete logic
├── Code.gs             ← complete, ready to paste in Apps Script
├── README.md           ← complete, step-by-step setup guide
├── CLAUDE.md           ← agent guide (keep for reference)
└── assets/
    └── qr-placeholder.png
```

---

## Summary Table

| Phase | Task | Est. Complexity |
|---|---|---|
| 0 | Skills + Setup | Low |
| 1 | Code.gs backend | Medium |
| 2 | HTML shell + Design system | Medium |
| 3 | S1 Welcome | Medium |
| 4 | S2 Competition + Bottom sheet | Medium |
| 5 | S3 Details + GET check | High |
| 6 | S4 Team setup | Medium |
| 7 | S5 Review + POST | High |
| 8 | S6 Success card | Medium |
| 9 | SX Already registered | Low |
| 10 | SY Added as member | Low |
| 11 | Error + loading states | Low |
| 12 | Animations + polish | Medium |
| 13 | README.md | Low |
| 14 | Quality checklist | Medium |

---

*Implementation Plan v1.0 — JagranEcoFest — Ayush Gupta, BCA 3rd Year*

