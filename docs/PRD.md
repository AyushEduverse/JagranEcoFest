# Product Requirements Document (PRD)
## World Environment Day — Event Registration Web App
### Jagran College of Arts, Science and Commerce

---

| Field | Details |
|---|---|
| **Project Name** | JagranEcoFest |
| **Document Version** | v1.1 |
| **Created By** | Ayush Gupta — BCA 3rd Year |
| **Contact** | 7390841128 |
| **Created On** | 23 May 2026 |
| **Last Updated** | 23 May 2026 |
| **Event Date** | 5 June 2026 |
| **Registration Deadline** | 30 May 2026 |
| **Sheet Access** | NSS Teacher — Kanika Mam (only) |

---

### Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 23 May 2026 | Initial draft |
| v1.1 | 23 May 2026 | Removed Roll No field; Members now use Name + Batch; Confirmed tech stack; Resolved OQ1–OQ4; Added Already Registered screen; Added Added-as-Member screen; Updated data schema |

---

## 1. Project Overview

Jagran College of Arts, Science and Commerce is organizing a **World Environment Day 2026** event featuring two student competitions — a **Poster/Slogan Making Competition** and a **Quiz Competition**. Currently, registration is being collected manually through coordinators, which leads to missed entries, duplicate data, and no structured record.

This project is a **mobile-first, multi-step onboarding web app** that allows students to register for either or both competitions digitally. All submissions are automatically stored in a **Google Sheet** via Google Apps Script — accessible only by NSS Teacher Kanika Mam. The app link is shared via WhatsApp.

---

## 2. Problem Statement

- Registration is currently handled verbally or through WhatsApp messages to coordinators, making tracking difficult.
- No structured data collection — name and batch are often missing or inconsistent.
- Quiz teams have no formal registration, making it hard to manage team sizes.
- Students are unaware of guidelines at the time of registration.
- No confirmation is given to students after they register.
- Team members added by a captain have no way of knowing they're registered or viewing event details.

---

## 3. Goals & Objectives

| # | Goal |
|---|---|
| G1 | Allow students to register for competitions from their mobile phones |
| G2 | Capture all required student details in a structured format |
| G3 | Store every registration entry automatically in a Google Sheet (access: Kanika Mam only) |
| G4 | Support quiz team registration with 2–3 flexible team size |
| G5 | Show students a screenshottable confirmation card after submission |
| G6 | Keep the experience fast, simple, and mobile-friendly |
| G7 | Reflect the nature/eco theme visually to match the event identity |
| G8 | Prevent duplicate registrations — show a clean "Already Registered" page if re-attempted |
| G9 | Allow team members added by a captain to view their registration status and event details without re-registering |

---

## 4. Target Users

**Primary Users:** Students of Jagran College of Arts, Science and Commerce

- Age group: 17–23 years
- Device: Mobile only (Android & iOS)
- Tech comfort: Basic — can fill a form, tap buttons, take screenshots
- Access: WhatsApp link shared by coordinator → opens directly in mobile browser

**Secondary Users:** NSS Teacher — Kanika Mam

- Has sole access to the Google Sheet to track all registrations
- Does not interact with the app directly

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (no framework) |
| **Icons** | Font Awesome 6 CDN |
| **Fonts** | Google Fonts (Playfair Display + DM Sans) |
| **Backend** | Google Apps Script (Web App — `doPost` + `doGet`) |
| **Database** | Google Sheets (via Apps Script `appendRow` / `getValues`) |
| **Hosting** | GitHub Pages |
| **Distribution** | WhatsApp link + QR Code pointing to GitHub Pages URL |

### Architecture Diagram

```
[ Student opens WhatsApp link / scans QR Code ]
                    |
                    ▼
        [ GitHub Pages — HTML/CSS/JS files ]
                    |
          ┌─────────┴──────────┐
          |                    |
    [ GET request ]     [ POST request ]
    Check if phone      Submit registration
    already exists      (new entry)
          |                    |
          └─────────┬──────────┘
                    ▼
     [ Google Apps Script Web App ]
                    |
                    ▼
        [ Google Sheet — Kanika Mam ]
```

---

## 6. Scope

### In Scope
- 6-screen multi-step registration flow
- "Already Registered" special page (duplicate prevention)
- "Added as Team Member" special page (for members added by a captain)
- Two competition tracks: Poster/Slogan & Quiz
- Google Apps Script backend (GET to check, POST to write — Google Sheet)
- Screenshottable confirmation card
- Competition rules accessible via bottom sheet (non-blocking)
- Mobile-responsive design (earthy/nature theme)
- Shared via WhatsApp link + QR Code (GitHub Pages hosted)

### Out of Scope
- Admin dashboard / login panel
- Email or SMS confirmation
- Payment gateway
- Editing or cancelling a submitted entry
- Desktop-optimised layout
- Offline/PWA support

---

## 7. App Flow — Complete Map

```
Student opens app link
          |
          ▼
          ▼
    Screen 1: Welcome
          |
          ▼
    Screen 2: Choose Competition
          |
          ▼
    Screen 3: Your Details (Name + Batch)
          |
    [App checks Sheet via GET]
          |
    ┌─────┴──────┐──────────────────┐                      |
    |            |                  |                      |
  NEW USER   ALREADY           ADDED AS               (no match)
             REGISTERED        TEAM MEMBER
             ↓                 ↓
     Screen X:          Screen Y:
   "Already            "You've Been
   Registered"          Added" Page
   (show details)     (show event info)

          ↓ (new user continues)
    Screen 2: Choose Competition
          |
          ▼
    Screen 3: Your Details (Name + Batch)
          |
     ┌────┴─────┐
     |          |
  Poster      Quiz / Both
  Only           |
     |      Screen 4: Team Setup
     |           |
     └─────┬─────┘
           ▼
    Screen 5: Review & Submit
           |
           ▼
    Screen 6: Success + Confirmation Card
```

---

## 8. Screen-by-Screen Specifications

---

### Screen 1 — Welcome / Landing

**Purpose:** Create a strong first impression and orient the student to the event. Collect phone number as the unique identifier before proceeding.

**Content:**
- College name: *Jagran College of Arts, Science and Commerce*
- Event title: *World Environment Day 2026*
- Event date badge: *5th June 2026*
- Tagline: *"Celebrate. Create. Conserve."*
- CTA button: **Get Started →**
- Deadline note: *"Last date to register: 30 May 2026"*

**Logic on "Get Started":**
1. Proceed to Screen 2.
2. Duplicate check runs **after Name + Batch are filled on Screen 3**, using this priority order:

| Step | Check | Result |
|---|---|---|
| 1 | Name + Batch both match | ✅ Confirmed duplicate → show Screen X |
| 2 | Name matches but Batch is different | Not a duplicate — proceed normally |
| 3 | No name match at all | New user — proceed normally |

> **Why this order?** Name and Batch combination uniquely identifies a student within the college context.

**Design Notes:**
- Full-screen earthy hero — deep greens, warm browns, leaf/nature textures
- Font Awesome leaf icon `fa-leaf` in hero area
- Playfair Display for event title
- Animated leaf elements or subtle nature pattern in background

---

### Screen 2 — Choose Competition

**Purpose:** Student selects which competition(s) they want to participate in.

**Options (tap cards):**

| Option | FA Icon | Label |
|---|---|---|
| Poster/Slogan | `fa-palette` | Poster & Slogan Making |
| Quiz | `fa-brain` | Quiz Competition |
| Both | `fa-star` | Both Competitions |

**Rules Access (non-blocking):**
- Each card has a small **"View Rules"** button with `fa-circle-info` icon
- Tapping opens a **bottom sheet overlay** with the relevant guidelines
- Student can close the sheet and continue — does NOT block progression

**Poster Rules (in bottom sheet):**
- Size: A3 or A2, sturdy paper/cardboard
- Slogan in bold lettering
- Eco-friendly materials only (newspaper, natural colors, jute, bottle caps)
- No plastic or glitter
- Label back: Name, Class
- Bring finished poster to college on 5th June

**Quiz Rules (in bottom sheet):**
- Team size: 2–3 students
- Round 1: 10 MCQs × 1 pt — Basic environment facts (No elimination, 30 sec/q)
- Round 2: 5 Visual/Audio × 2 pts — Endangered animals, bird calls, pollution images, eco logos (Bottom 1–2 teams eliminated, 60 sec/q)
- Round 3: Rapid Fire Buzzer — 2 min/team, +10 correct / −5 wrong — Climate change, conservation laws, eco-news (Top 2–3 teams only)

**Validation:** Must select at least one option to proceed.

---

### Screen 3 — Student / Personal Details

**Purpose:** Capture the registering student's identity. Roll Number is NOT collected.

**Fields:**

| Field | Type | Required | Placeholder |
|---|---|---|---|
| Full Name | Text input | Yes | e.g. Ayush Gupta |
| Batch | Text input | Yes | e.g. BCA 3rd Year |

**Validation Rules:**
- Both fields required, no empty submissions
- Name: letters and spaces only, min 3 characters

**Design Notes:**
- Earthy input field styling — warm brown borders, green focus ring
- Font Awesome icons inside inputs: `fa-user`, `fa-graduation-cap`
- Step progress indicator: e.g. Step 2 of 4

---

### Screen 4 — Team Setup *(Quiz / Both only)*

**Purpose:** Register the quiz team. Team captain adds 1–2 more members by Name + Batch. No Roll No required for members.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Team Name | Text input | Yes | e.g. EcoWarriors |
| Member 2 — Full Name | Text input | Yes | Minimum 1 extra member |
| Member 2 — Batch | Text input | Yes | e.g. BCA 2nd Year |
| Member 3 — Full Name | Text input | No | Optional |
| Member 3 — Batch | Text input | No | Required if Member 3 name is filled |

**Member 1** is auto-displayed (read-only chip) using the name and batch from Screen 3. They are the team captain / form filler.

**Interaction:**
- Member 3 section is **hidden by default**
- A green **"+ Add 3rd Member"** button (`fa-user-plus`) reveals it
- A **"− Remove"** link (`fa-trash`) collapses and clears Member 3

**Validation Rules:**
- Team name required
- Member 2 name + batch both required
- Member 3: if either field filled, both must be filled

**Design Notes:**
- Each member shown as a distinct card block with green left border
- Member 1 card shows a `fa-crown` icon (captain)
- Member 2/3 cards show `fa-user` icon

---

### Screen 5 — Review & Submit

**Purpose:** Full summary of all entered data for the student to verify before submission.

**Summary Sections:**

**Your Details**
- Name, Batch
- Competition badge chip

**Team (if Quiz/Both)**
- Team Name
- Member 1 (Captain): Name, Batch
- Member 2: Name, Batch
- Member 3: Name, Batch *(if added)*

**Deadline reminder chip:** *"Registration closes 30 May 2026"*

**Actions:**
- **Edit** (`fa-pen`) link next to each section — navigates back to relevant step
- **Submit Entry →** (`fa-paper-plane`) — primary green CTA button

**Loading State:**
- Button disabled, shows `fa-spinner fa-spin` + *"Submitting…"*
- All edit links hidden during submission

**Error State:**
- Toast/snackbar: *"Something went wrong. Please check your connection and try again."*
- Retry button re-enabled

---

### Screen 6 — Success + Confirmation Card

**Purpose:** Confirm the registration. Provide a card the student can screenshot as proof.

**Top Section (celebratory):**
- Animated `fa-circle-check` icon (green, pulsing)
- Headline: *"You're In! 🌿"*
- Subtext: *"Your registration is confirmed. See you on 5th June 2026!"*

**Confirmation Card (screenshottable block):**

```
┌──────────────────────────────────────┐
│  🌿  World Environment Day 2026      │
│  Jagran College of Arts,             │
│  Science and Commerce                │
├──────────────────────────────────────┤
│  Name         :  Ayush Gupta         │
│  Batch        :  BCA 3rd Year        │
│  Competition  :  Quiz Competition    │
│  Team         :  EcoWarriors         │
├──────────────────────────────────────┤
│  ✅  Entry Confirmed                  │
│  Registered on : 23 May 2026         │
└──────────────────────────────────────┘
```

**Actions below card:**
- **📸 Save / Screenshot this card** (`fa-camera`) — prompts user with a "Long press or screenshot to save"
- **Register Another Student** (`fa-rotate-left`) — resets flow to Screen 1 (for coordinators helping others)

---

### Screen X — Already Registered Page *(Special State)*

**Matching Priority:**
1. Filter rows where **Name matches** (case-insensitive)
2. From those, filter where **Batch also matches**

If Name matches but Batch is different → the student is a different person → proceed normally.

**Purpose:** Prevent duplicate submission. Show a clean, friendly page with their existing registration details.

**Design:**
- Warm earthy page, distinct from the main flow
- Font Awesome icon: `fa-circle-check` in golden/amber (already done — not an error)
- Headline: *"You're Already Registered! 🌿"*
- Subtext: *"We already have your entry for World Environment Day 2026. No need to register again."*

**Details Shown (fetched from Sheet):**

```
┌──────────────────────────────────────┐
│  Your Registration Details           │
├──────────────────────────────────────┤
│  Name         :  [from sheet]        │
│  Batch        :  [from sheet]        │
│  Competition  :  [from sheet]        │
│  Team         :  [from sheet]        │
│  Registered   :  [timestamp]         │
└──────────────────────────────────────┘
```

**Actions:**
- **📸 Save this card** — same screenshot hint
- No re-registration option shown

---

### Screen Y — Added as Team Member Page *(Special State)*

**Trigger:** When a student opens the app, enters their Name + Batch at Screen 3, and that combination is found in the Sheet as Member 2 or Member 3 of a team.

**Purpose:** The member was already registered by their team captain — they do not need to fill the form again. Show them a warm, informative page confirming their status and event details.

**Design:**
- Warm, celebratory earthy page
- Font Awesome icon: `fa-users` in forest green
- Headline: *"You're Already Part of the Team! 🌿"*

**Message shown:**
> *"Great news! [Captain Name] has already added you to their quiz team for World Environment Day 2026. You don't need to register separately."*

**Their Details Block:**

```
┌──────────────────────────────────────┐
│  Your Team Registration              │
├──────────────────────────────────────┤
│  Your Name    :  [Member Name]       │
│  Your Batch   :  [Member Batch]      │
│  Team Name    :  [Team Name]         │
│  Captain      :  [Captain Name]      │
│  Competition  :  Quiz Competition    │
├──────────────────────────────────────┤
│  ✅  You're Registered via your Team  │
└──────────────────────────────────────┘
```

**Event Details Block (below):**

```
📅  Event Date     :  5th June 2026
🏫  Venue          :  Jagran College of Arts, Science & Commerce
🧠  Competition    :  Quiz — 3 Rounds, Rapid Fire Buzzer
⏰  Register by    :  30 May 2026 (already done!)
```

**Actions:**
- **📸 Save this card** — screenshot hint
- **View Quiz Rules** (`fa-book-open`) — opens the rules bottom sheet

---

## 9. Data Schema — Google Sheet

Each registration creates one row in the Google Sheet. Kanika Mam is the only person with edit/view access.

| Col | Field | Source | Example |
|---|---|---|---|
| A | Timestamp | Auto (Apps Script) | 23/05/2026 14:32:11 |
| B | Full Name | Screen 3 | Ayush Gupta |
| C | Batch | Screen 3 | BCA 3rd Year |
| D | Competition | Screen 2 | Quiz / Poster / Both |
| E | Team Name | Screen 4 | EcoWarriors |
| F | Member 2 Name | Screen 4 | Riya Sharma |
| G | Member 2 Batch | Screen 4 | BCA 2nd Year |
| H | Member 3 Name | Screen 4 | (blank if not added) |
| I | Member 3 Batch | Screen 4 | (blank if not added) |

**Notes:**
- Roll Number and Phone Number are **not collected** anywhere in this version
- Columns E–I are blank for Poster-only registrations
- Name + Batch combination is the **unique key** for duplicate prevention (checked via GET before form submission)
- Name + Batch combination (Cols F–G, H–I) used for "Added as Member" screen lookup
- Sheet header row (Row 1) is auto-created by Apps Script on first run

---

## 10. Google Apps Script — Endpoints

### POST — Submit Registration
Appends a new row to the Sheet.

**Request body (JSON):**
```json
{
  "name": "Ayush Gupta",
  "batch": "BCA 3rd Year",
  "competition": "Quiz",
  "teamName": "EcoWarriors",
  "member2Name": "Riya Sharma",
  "member2Batch": "BCA 2nd Year",
  "member3Name": "",
  "member3Batch": ""
}
```

**Response:**
```json
{ "status": "success" }
```

---

### GET — Check Registration Status
Called after the student fills Name + Batch on Screen 3.

**Matching Priority:**
1. Filter rows where **Name matches** (case-insensitive)
2. From those, filter where **Batch also matches**

**Request params:**
`?name=Ayush Gupta&batch=BCA 3rd Year`

**Response (confirmed duplicate — name + batch match):**
```json
{
  "status": "already_registered",
  "data": { "name": "...", "batch": "...", "competition": "...", "teamName": "...", "timestamp": "..." }
}
```

**Response (team member found — name + batch match in member columns):**
```json
{
  "status": "added_as_member",
  "data": { "memberName": "...", "memberBatch": "...", "teamName": "...", "captainName": "...", "competition": "Quiz" }
}
```

**Response (name matches but batch is different — or no match at all):**
```json
{ "status": "new_user" }
```

---

## 11. Hosting & Distribution

### GitHub Pages
- Repository: `JagranEcoFest` (public)
- Main files: `index.html`, `style.css`, `script.js` in root
- URL format: `https://[username].github.io/JagranEcoFest`
- Apps Script Web App URL stored as a JS constant in `script.js`

### WhatsApp Sharing
- The GitHub Pages URL is shared as a WhatsApp message by NSS coordinator to class groups
- Message format:
  > *🌿 World Environment Day Registration Open!*
  > *Register here 👇*
  > *[GitHub Pages URL]*
  > *Last date: 30 May 2026*

### QR Code
- A QR Code pointing to the GitHub Pages URL is generated
- Printed and displayed on the college notice board / event posters
- Students scan to open directly in mobile browser

---

## 12. UI / UX Design Requirements

### Theme
**Natural & Earthy** — inspired by forests, soil, and organic textures.

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Background | Warm Cream | `#F5F0E8` |
| Primary | Deep Forest Green | `#2D5A27` |
| Secondary | Golden Brown | `#8B6914` |
| Accent | Terracotta | `#C4874A` |
| Dark | Very Dark Green | `#1A2F18` |
| Light Surface | Light Sage | `#E8F5E3` |
| Body Text | Dark Brown | `#2C1810` |
| Already Registered | Amber/Gold | `#D4A017` |
| Added as Member | Forest Green | `#2D5A27` |

### Typography
- **Display / Headings:** Playfair Display (Google Fonts, serif)
- **Body / Inputs:** DM Sans (Google Fonts, clean and readable)

### Icons
- All icons via **Font Awesome 6 Free CDN**
- Key icons used: `fa-leaf`, `fa-palette`, `fa-brain`, `fa-star`, `fa-user`, `fa-graduation-cap`, `fa-phone`, `fa-users`, `fa-crown`, `fa-circle-check`, `fa-paper-plane`, `fa-camera`, `fa-pen`, `fa-circle-info`

### Visual Elements
- Leaf SVG decorations in background / corners
- Organic curved section dividers (CSS clip-path)
- Earthy textured card backgrounds (subtle noise via CSS)
- Step progress bar in green
- Bottom sheet overlays for rules

### Mobile Design Constraints
- Max-width: 430px (centered on larger screens)
- Touch targets: minimum 48×48px
- No hover-only interactions
- Sticky bottom CTA buttons
- Numeric keyboard auto-triggered for phone field (`inputmode="numeric"`)
- No horizontal scrolling at any step

---

## 13. Non-Functional Requirements

| Requirement | Expectation |
|---|---|
| Performance | Loads under 3 seconds on 4G connection |
| Compatibility | Chrome Android, Safari iOS (last 2 versions) |
| Offline/Error | Show friendly toast if submission fails — "Check your internet and retry" |
| Accessibility | Min 16px font on inputs, sufficient color contrast (WCAG AA) |
| Data Safety | No sensitive data stored in browser; direct POST/GET to Apps Script |
| Form Persistence | If user taps "Edit" and goes back, all previously filled values remain |
| Duplicate Safety | Name is checked first, then Batch to confirm. Phone used only as final tiebreaker when Name + Batch match multiple rows |

---

## 14. Success Metrics

| Metric | Target |
|---|---|
| Registrations before 30 May 2026 | All interested students successfully registered |
| Form completion rate | > 85% (users who start, finish) |
| Duplicate registrations | Zero — enforced by Name → Batch → Phone (fallback) check after Screen 3 |
| Missing required fields in Sheet | Zero — enforced by frontend validation |
| Team members seeing correct "Added" page | 100% of added members who open the app |

---

## 15. Open Questions / Decisions Pending

| # | Question | Decision | Owner |
|---|---|---|---|
| OQ1 | Should duplicate registrations be prevented? | ✅ YES — match by Name first, then Batch to confirm. Phone used only as tiebreaker if Name + Batch both match multiple rows | Resolved |
| OQ2 | Who has Google Sheet access? | ✅ NSS Teacher Kanika Mam only | Resolved |
| OQ3 | How is the app URL distributed? | ✅ WhatsApp link + QR Code on notice board | Resolved |
| OQ4 | Do team members need to register separately? | ✅ NO — members added by captain see "Added as Member" page with event details | Resolved |
| OQ5 | Is there a cap on quiz teams or poster entries? | ❓ TBD | Kanika Mam / Faculty |

---

## 16. Appendix — Competition Rules Reference

### Poster/Slogan Making
- Size: A3 or A2, sturdy paper or cardboard
- Slogan in bold lettering
- Eco-friendly materials: newspaper collage, natural colors, jute, used bottle caps
- No plastic or glitter
- Bring finished poster to college on 5th June
- Label the back: Name, Class

### Quiz Competition
- **Team Size:** 2–3 students per team
- **Round 1 — Warm-Up MCQ** (No elimination): 10 questions × 1 point. Basic environment facts. 30 sec/question
- **Round 2 — Visual + Audio** (Bottom 1–2 teams eliminated): 5 questions × 2 points. Endangered animals, bird calls, pollution images, eco-org logos. 60 sec/question
- **Round 3 — Rapid Fire Buzzer** (Top 2–3 teams only): 2 min/team. +10 correct / −5 wrong. Climate change, conservation laws, recent eco-news

---

*Document v1.1 — prepared for internal development use. Subject to revision based on coordinator feedback.*

