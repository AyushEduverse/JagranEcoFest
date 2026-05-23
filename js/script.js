  /* ------------------------------------------------------------------
     APPS SCRIPT URL — replace with your deployed Web App URL
  ------------------------------------------------------------------ */
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzdw1iWl0-CmJ1wqFpVpydd-sNrlZ14FFmbrWcizOEwnLKYMVehyNbbrkr4Rxis9hOWw/exec';

  /* ------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------ */
  const appState = {

    competition: '',
    name:        '',
    batch:       '',
    teamName:    '',
    m2name:      '',
    m2batch:     '',
    m3name:      '',
    m3batch:     '',
    currentScreen: 's1',
    isLoading:   false,
    member3Visible: false,
  };

  /* ------------------------------------------------------------------
     NAVIGATE
  ------------------------------------------------------------------ */
  async function navigate(screenId) {
    if (window.AppAnimations) {
      await window.AppAnimations.pageTransition(appState.currentScreen, screenId);
    } else {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) {
        target.classList.add('active');
      }
      window.scrollTo(0, 0);
    }
    appState.currentScreen = screenId;
  }

  /* ------------------------------------------------------------------
     RESET APP
  ------------------------------------------------------------------ */
  function resetApp() {
    Object.assign(appState, {
      competition: '', name: '', batch: '',
      teamName: '', m2name: '', m2batch: '', m3name: '', m3batch: '',
      currentScreen: 's1', isLoading: false, member3Visible: false,
    });
    // Clear all inputs
    document.querySelectorAll('input').forEach(i => i.value = '');
    // Deselect comp cards
    document.querySelectorAll('.comp-card').forEach(c => c.classList.remove('selected'));
    // Hide member 3
    document.getElementById('member3Card').classList.add('hidden');
    document.getElementById('addM3Btn').classList.remove('hidden');
    // Clear errors
    document.querySelectorAll('.input-error').forEach(e => e.classList.add('hidden'));
    document.querySelectorAll('input').forEach(i => i.classList.remove('error-state'));
    navigate('s1');
  }

  /* ------------------------------------------------------------------
     SCREEN 1 — START APP
  ------------------------------------------------------------------ */
  function startApp() {
    navigate('s2');
  }

  /* ------------------------------------------------------------------
     SCREEN 2 — SELECT COMPETITION
  ------------------------------------------------------------------ */
  function selectComp(type, evt) {
    // Remove selected from all cards
    document.querySelectorAll('.comp-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('card-' + type).classList.add('selected');
    appState.competition = type;
    document.getElementById('compError').classList.add('hidden');
  }

  function continueFromS2() {
    if (!appState.competition) {
      document.getElementById('compError').classList.remove('hidden');
      return;
    }
    document.getElementById('compError').classList.add('hidden');
    navigate('s3');
  }

  /* ------------------------------------------------------------------
     SCREEN 3 — YOUR DETAILS + GET CHECK
  ------------------------------------------------------------------ */
  function continueFromS3() {
    const nameInput  = document.getElementById('nameInput');
    const batchInput = document.getElementById('batchInput');
    const nameErr    = document.getElementById('nameError');
    const batchErr   = document.getElementById('batchError');
    let   valid      = true;

    // Validate name
    const name = nameInput.value.trim();
    if (!/^[A-Za-z\s]{3,}$/.test(name)) {
      nameInput.classList.add('error-state');
      nameErr.classList.remove('hidden');
      valid = false;
    } else {
      nameInput.classList.remove('error-state');
      nameErr.classList.add('hidden');
    }

    // Validate batch
    const batch = batchInput.value.trim();
    if (batch.length < 2) {
      batchInput.classList.add('error-state');
      batchErr.classList.remove('hidden');
      valid = false;
    } else {
      batchInput.classList.remove('error-state');
      batchErr.classList.add('hidden');
    }

    if (!valid) return;

    appState.name  = name;
    appState.batch = batch;

    // Show loading
    setLoading(true, 'Checking registration…');
    setS3Btn(true);

    checkRegistrationStatus(name, batch)
      .then(res => {
        setLoading(false);
        setS3Btn(false);

        if (res.status === 'already_registered') {
          populateSX(res.data);
          navigate('sx');
        } else if (res.status === 'added_as_member') {
          populateSY(res.data);
          navigate('sy');
        } else {
          // new_user or error — proceed
          if (appState.competition === 'poster') {
            navigate('s5');
            populateS5();
          } else {
            // quiz or both → team setup
            document.getElementById('m1NameDisplay').textContent  = appState.name;
            document.getElementById('m1BatchDisplay').textContent = appState.batch;
            navigate('s4');
          }
        }
      })
      .catch(err => {
        setLoading(false);
        setS3Btn(false);
        console.error('GET error:', err);
        // Notify user that the check failed, then proceed (fail open)
        showToast('Could not check registration status. Proceeding as new user.');
        // On network error — treat as new user (fail open)
        if (appState.competition === 'poster') {
          navigate('s5');
          populateS5();
        } else {
          document.getElementById('m1NameDisplay').textContent  = appState.name;
          document.getElementById('m1BatchDisplay').textContent = appState.batch;
          navigate('s4');
        }
      });
  }

  function setS3Btn(disabled) {
    const btn = document.getElementById('s3Btn');
    btn.disabled = disabled;
    btn.innerHTML = disabled
      ? '<i class="fa-solid fa-spinner fa-spin"></i> Checking…'
      : 'Continue <i class="fa-solid fa-arrow-right"></i>';
  }

  /* ------------------------------------------------------------------
     SCREEN 4 — TEAM SETUP
  ------------------------------------------------------------------ */
  function toggleMember3(show) {
    const card  = document.getElementById('member3Card');
    const addBtn = document.getElementById('addM3Btn');
    appState.member3Visible = show;
    if (show) {
      addBtn.classList.add('hidden');
      if (window.AppAnimations) window.AppAnimations.toggleMember3(card, true);
      else card.classList.remove('hidden');
    } else {
      addBtn.classList.remove('hidden');
      if (window.AppAnimations) window.AppAnimations.toggleMember3(card, false);
      else card.classList.add('hidden');
      // Clear M3 fields + errors
      document.getElementById('m3NameInput').value = '';
      document.getElementById('m3BatchInput').value = '';
      document.getElementById('m3NameError').classList.add('hidden');
      document.getElementById('m3BatchError').classList.add('hidden');
      document.getElementById('m3NameInput').classList.remove('error-state');
      document.getElementById('m3BatchInput').classList.remove('error-state');
    }
  }

  function continueFromS4() {
    const teamNameInput = document.getElementById('teamNameInput');
    const m2NameInput   = document.getElementById('m2NameInput');
    const m2BatchInput  = document.getElementById('m2BatchInput');
    const m3NameInput   = document.getElementById('m3NameInput');
    const m3BatchInput  = document.getElementById('m3BatchInput');
    let valid = true;

    // Team name
    if (!teamNameInput.value.trim()) {
      teamNameInput.classList.add('error-state');
      document.getElementById('teamNameError').classList.remove('hidden');
      valid = false;
    } else {
      teamNameInput.classList.remove('error-state');
      document.getElementById('teamNameError').classList.add('hidden');
    }

    // M2 name
    if (!m2NameInput.value.trim()) {
      m2NameInput.classList.add('error-state');
      document.getElementById('m2NameError').classList.remove('hidden');
      valid = false;
    } else {
      m2NameInput.classList.remove('error-state');
      document.getElementById('m2NameError').classList.add('hidden');
    }

    // M2 batch
    if (!m2BatchInput.value.trim()) {
      m2BatchInput.classList.add('error-state');
      document.getElementById('m2BatchError').classList.remove('hidden');
      valid = false;
    } else {
      m2BatchInput.classList.remove('error-state');
      document.getElementById('m2BatchError').classList.add('hidden');
    }

    // M3 partial fill check
    if (appState.member3Visible) {
      const m3n = m3NameInput.value.trim();
      const m3b = m3BatchInput.value.trim();
      if (m3n || m3b) {
        if (!m3n) {
          m3NameInput.classList.add('error-state');
          document.getElementById('m3NameError').classList.remove('hidden');
          valid = false;
        } else {
          m3NameInput.classList.remove('error-state');
          document.getElementById('m3NameError').classList.add('hidden');
        }
        if (!m3b) {
          m3BatchInput.classList.add('error-state');
          document.getElementById('m3BatchError').classList.remove('hidden');
          valid = false;
        } else {
          m3BatchInput.classList.remove('error-state');
          document.getElementById('m3BatchError').classList.add('hidden');
        }
      }
    }

    if (!valid) return;

    appState.teamName = teamNameInput.value.trim();
    appState.m2name   = m2NameInput.value.trim();
    appState.m2batch  = m2BatchInput.value.trim();
    appState.m3name   = appState.member3Visible ? m3NameInput.value.trim() : '';
    appState.m3batch  = appState.member3Visible ? m3BatchInput.value.trim() : '';

    populateS5();
    navigate('s5');
  }

  /* ------------------------------------------------------------------
     SCREEN 5 — REVIEW & SUBMIT
  ------------------------------------------------------------------ */
  function populateS5() {
    // Competition chip
    const chip    = document.getElementById('reviewCompChip');
    const compMap = {
      poster: { label: '🎨 Poster & Slogan Making', cls: 'chip-accent' },
      quiz:   { label: '🧠 Quiz Competition',       cls: 'chip-green' },
      both:   { label: '⭐ Both Competitions',       cls: 'chip-amber' },
    };
    const comp = compMap[appState.competition] || { label: appState.competition, cls: 'chip-green' };
    chip.textContent = comp.label;
    chip.className   = 'chip ' + comp.cls;

    // Your details
    document.getElementById('reviewName').textContent  = appState.name;
    document.getElementById('reviewBatch').textContent = appState.batch;


    // Team card
    const teamCard = document.getElementById('reviewTeamCard');
    if (appState.competition === 'poster') {
      teamCard.classList.add('hidden');
    } else {
      teamCard.classList.remove('hidden');
      document.getElementById('reviewTeamName').textContent = appState.teamName;
      document.getElementById('reviewM1').textContent       = appState.name;
      document.getElementById('reviewM1Batch').textContent  = appState.batch;
      document.getElementById('reviewM2').textContent       = appState.m2name;
      document.getElementById('reviewM2Batch').textContent  = appState.m2batch;

      const m3row = document.getElementById('reviewM3Row');
      if (appState.m3name) {
        m3row.classList.remove('hidden');
        document.getElementById('reviewM3').textContent      = appState.m3name;
        document.getElementById('reviewM3Batch').textContent = appState.m3batch;
      } else {
        m3row.classList.add('hidden');
      }
    }
  }

  function goBackFromS5() {
    if (appState.competition === 'poster') {
      navigate('s3');
    } else {
      navigate('s4');
    }
  }

  async function submitEntry() {
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    window.AppAnimations?.morphSubmitButton(btn, true);
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';

    // Build competition-aware payload matching Code.gs
    let payload = {};

    if (appState.competition === 'poster') {
      // Poster sheet has only 5 columns — no team member data
      payload = {
        name:        appState.name,
        batch:       appState.batch,
        competition: appState.competition,
        teamName:    '',
        m2name:      '',
        m2batch:     '',
        m3name:      '',
        m3batch:     '',
      };
    } else {
      // Quiz / Both — full 9 columns with team data
      payload = {
        name:        appState.name,
        batch:       appState.batch,
        competition: appState.competition,
        teamName:    appState.teamName,
        m2name:      appState.m2name,
        m2batch:     appState.m2batch,
        m3name:      appState.m3name,
        m3batch:     appState.m3batch,
      };
    }

    try {
      const res = await submitRegistration(payload);
      if (res && res.status === 'success') {
        populateS6();
        navigate('s6');
      } else {
        throw new Error((res && res.message) || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('POST error:', err);
      showToast();
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Entry';
      window.AppAnimations?.morphSubmitButton(btn, false);
    }
  }

  /* ------------------------------------------------------------------
     SCREEN 6 — POPULATE SUCCESS CARD
  ------------------------------------------------------------------ */
  function populateS6() {
    document.getElementById('c6Name').textContent  = appState.name;
    document.getElementById('c6Batch').textContent = appState.batch;

    // Match competition labels to Code.gs SHEET_NAMES
    const compLabels = {
      poster: 'Poster & Slogan Making',
      quiz:   'Quiz Competition',
      both:   'Both Competitions'
    };
    document.getElementById('c6Comp').textContent = compLabels[appState.competition] || appState.competition;

    const teamRow = document.getElementById('c6TeamRow');
    if (appState.competition !== 'poster' && appState.teamName) {
      teamRow.classList.remove('hidden');
      document.getElementById('c6Team').textContent = appState.teamName;
    } else {
      teamRow.classList.add('hidden');
    }
    document.getElementById('c6Time').textContent = 'Registered on ' + formatDate(new Date());
  }

  /* ------------------------------------------------------------------
     SCREEN SX — ALREADY REGISTERED
  ------------------------------------------------------------------ */
  function populateSX(data) {
    document.getElementById('sxName').textContent  = data.name  || '—';
    document.getElementById('sxBatch').textContent = data.batch || '—';

    // Map competition key to full label
    const compLabels = {
      poster: 'Poster & Slogan Making',
      quiz:   'Quiz Competition',
      both:   'Both Competitions'
    };
    const compDisplay = compLabels[data.competition] || data.competition || '—';
    document.getElementById('sxComp').textContent = compDisplay;

    const sxTeamRow = document.getElementById('sxTeamRow');
    const isPoster = data.competition === 'poster' || data.competition === 'Poster & Slogan Making';
    if (data.teamName && data.teamName !== '-' && !isPoster) {
      sxTeamRow.classList.remove('hidden');
      document.getElementById('sxTeam').textContent = data.teamName;
    } else {
      sxTeamRow.classList.add('hidden');
    }

    let ts = '—';
    if (data.timestamp) {
      try {
        ts = formatDate(new Date(data.timestamp));
      } catch (e) {
        ts = String(data.timestamp).split('T')[0];
      }
    }
    document.getElementById('sxTime').textContent = ts;
  }

  /* ------------------------------------------------------------------
     SCREEN SY — ADDED AS MEMBER
  ------------------------------------------------------------------ */
  function populateSY(data) {
    document.getElementById('syCaptainMsg').textContent =
      (data.captainName ? data.captainName : 'Your team captain') +
      ' has already added you to their quiz team.';
    document.getElementById('syMemberName').textContent  = data.memberName  || '—';
    document.getElementById('syMemberBatch').textContent = data.memberBatch || '—';
    document.getElementById('syTeamName').textContent    = data.teamName    || '—';
    document.getElementById('syCaptainName').textContent = data.captainName || '—';
    document.getElementById('syComp').textContent        = data.competition || 'Quiz Competition';
  }

  /* ------------------------------------------------------------------
     BOTTOM SHEET
  ------------------------------------------------------------------ */
  const POSTER_RULES_HTML = `
    <div class="sheet-section-title"><i class="fa-solid fa-palette"></i> Poster + Slogan Guidelines</div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Size:</strong> Stick to A3 or A2 so it’s visible but easy to carry. Use sturdy paper/cardboard.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Theme Clarity:</strong> Slogan should be bold lettering.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Materials:</strong> Encourage eco-friendly: newspaper collage, natural colors, jute, used bottle caps. <span style="color:var(--error);font-weight:600;">Avoid plastic/glitter.</span></p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Submission:</strong> Bring finished poster to college on <strong>5th June 2026</strong>.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Label Back Side:</strong> Name, Class, Roll No.</p></div>
  `;

  const QUIZ_RULES_HTML = `
    <div class="sheet-section-title"><i class="fa-solid fa-users-gear"></i> Basic Setup</div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Team Size:</strong> 2–3 students per team.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Rounds:</strong> 3, each with elimination or points.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Time:</strong> 30s for regular, 60s for picture/audio.</p></div>

    <div class="sheet-section-title" style="color:var(--text);"><i class="fa-solid fa-1"></i> Warm-Up MCQ <span style="font-size:12px; font-weight:500; color:var(--primary); background:rgba(45,90,39,0.1); padding:2px 8px; border-radius:8px; margin-left:6px;">No Elimination</span></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p>10 questions, 1 point each.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Topics:</strong> Basic environment facts.</p></div>

    <div class="sheet-section-title" style="color:var(--text);"><i class="fa-solid fa-2"></i> Visual + Audio <span style="font-size:12px; font-weight:500; color:var(--error); background:rgba(192,57,43,0.1); padding:2px 8px; border-radius:8px; margin-left:6px;">Elimination</span></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p>5 questions, 2 points each. <strong>Bottom 1–2 teams eliminated.</strong></p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Identify:</strong> Endangered animals, bird calls, pollution images, logos of environmental orgs.</p></div>

    <div class="sheet-section-title" style="color:var(--text);"><i class="fa-solid fa-3"></i> Rapid Fire Buzzer <span style="font-size:12px; font-weight:500; color:#B8860B; background:rgba(212,160,23,0.1); padding:2px 8px; border-radius:8px; margin-left:6px;">Top Teams Only</span></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p>2 minutes per team. <strong style="color:var(--primary);">+10</strong> for correct, <strong style="color:var(--error);">-5</strong> for wrong.</p></div>
    <div class="sheet-rule"><div class="sheet-rule-dot"></div><p><strong>Topics:</strong> Climate change, conservation laws, recent eco-news.</p></div>
  `;

  function openSheet(type) {
    const title   = document.getElementById('rulesSheetTitle');
    const content = document.getElementById('rulesSheetContent');
    if (type === 'poster') {
      title.textContent = 'Poster & Slogan Rules';
      content.innerHTML = POSTER_RULES_HTML;
    } else {
      title.textContent = 'Quiz Competition Rules';
      content.innerHTML = QUIZ_RULES_HTML;
    }
    document.getElementById('sheetBackdrop').classList.add('visible');
    document.getElementById('rulesSheet').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    document.getElementById('sheetBackdrop').classList.remove('visible');
    document.getElementById('rulesSheet').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ------------------------------------------------------------------
     TOAST
  ------------------------------------------------------------------ */
  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById('errorToast');
    const textEl = toast.querySelector('.toast-text');
    textEl.textContent = message || 'Something went wrong. Check your connection and retry.';
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 5000);
  }

  function retrySubmit() {
    document.getElementById('errorToast').classList.add('hidden');
    submitEntry();
  }

  /* ------------------------------------------------------------------
     LOADING OVERLAY
  ------------------------------------------------------------------ */
  function setLoading(show, msg) {
    const overlay = document.getElementById('loading-overlay');
    const text    = document.getElementById('loading-text');
    if (show) {
      text.textContent = msg || 'Loading…';
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  /* ------------------------------------------------------------------
     PASS MODAL — Popup with downloadable pass
  ------------------------------------------------------------------ */
  function openPassModal(sourceScreen) {
    sourceScreen = sourceScreen || 's6';
    const modal = document.getElementById('passModal');
    const backdrop = document.getElementById('passBackdrop');

    // Populate the pass card based on source screen
    if (sourceScreen === 'sx') {
      // Already registered — read from SX display fields
      document.getElementById('passName').textContent = document.getElementById('sxName').textContent;
      document.getElementById('passBatch').textContent = document.getElementById('sxBatch').textContent;
      document.getElementById('passComp').textContent = document.getElementById('sxComp').textContent;
      const sxTeam = document.getElementById('sxTeamRow');
      const passTeamRow = document.getElementById('passTeamRow');
      if (!sxTeam.classList.contains('hidden') && document.getElementById('sxTeam').textContent !== '—') {
        passTeamRow.classList.remove('hidden');
        document.getElementById('passTeam').textContent = document.getElementById('sxTeam').textContent;
      } else {
        passTeamRow.classList.add('hidden');
      }
      document.getElementById('passDate').textContent = document.getElementById('sxTime').textContent;
    } else if (sourceScreen === 'sy') {
      // Added as member — read from SY display fields
      document.getElementById('passName').textContent = document.getElementById('syMemberName').textContent;
      document.getElementById('passBatch').textContent = document.getElementById('syMemberBatch').textContent;
      document.getElementById('passComp').textContent = document.getElementById('syComp').textContent;
      const syTeam = document.getElementById('syTeamName').textContent;
      if (syTeam && syTeam !== '—') {
        document.getElementById('passTeamRow').classList.remove('hidden');
        document.getElementById('passTeam').textContent = syTeam;
      } else {
        document.getElementById('passTeamRow').classList.add('hidden');
      }
      document.getElementById('passDate').textContent = 'Registered via Team';
    } else {
      // S6 — Success (default)
      document.getElementById('passName').textContent = appState.name;
      document.getElementById('passBatch').textContent = appState.batch;
      const compLabels = {
        poster: 'Poster & Slogan Making',
        quiz:   'Quiz Competition',
        both:   'Both Competitions'
      };
      document.getElementById('passComp').textContent = compLabels[appState.competition] || appState.competition;
      const teamRow = document.getElementById('passTeamRow');
      if (appState.competition !== 'poster' && appState.teamName) {
        teamRow.classList.remove('hidden');
        document.getElementById('passTeam').textContent = appState.teamName;
      } else {
        teamRow.classList.add('hidden');
      }
      document.getElementById('passDate').textContent = 'Registered on ' + formatDate(new Date());
    }

    // Show modal with animation
    backdrop.classList.remove('hidden');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Re-enable download button
    const btn = document.getElementById('downloadPassBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-download"></i> Download Pass';
  }

  function closePassModal(evt) {
    // If backdrop clicked (no target), close
    if (evt && evt.target !== evt.currentTarget) return;
    document.getElementById('passBackdrop').classList.add('hidden');
    document.getElementById('passModal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  async function downloadPass() {
    const btn = document.getElementById('downloadPassBtn');
    const sourceCard = document.getElementById('passCard');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading…';

    try {
      // Lazy-load html2canvas
      if (typeof html2canvas === 'undefined') {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      // Lazy-load jsPDF
      if (typeof jspdf === 'undefined') {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating…';

      // Clone the card to a temporary container in-viewport for proper html2canvas capture
      // (Positioning off-screen at -9999px causes rendering issues in some browsers)
      const tempWrapper = document.createElement('div');
      tempWrapper.id = 'passCardCloneWrap';
      tempWrapper.style.cssText = 'position:fixed;top:0;left:0;width:400px;z-index:-1;opacity:0.001;pointer-events:none;';
      document.body.appendChild(tempWrapper);

      const clone = sourceCard.cloneNode(true);
      clone.style.cssText = 'width:400px;margin:0;';
      tempWrapper.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2.5,
        backgroundColor: '#FFFFFF',
        useCORS: true,
        logging: false,
        width: 400,
        height: clone.scrollHeight,
        windowWidth: 400,
        windowHeight: clone.scrollHeight
      });

      // Clean up
      document.body.removeChild(tempWrapper);

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;

      // A4: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Card aspect ratio
      const imgAspect = canvas.width / canvas.height;

      // Calculate dimensions to fit within A4 with balanced margins
      const pageW = 210;
      const pageH = 297;

      // Leave larger top/bottom margin for visual centering
      const horizontalMargin = 16;  // mm each side
      const verticalMargin = 24;    // mm each side
      const maxW = pageW - horizontalMargin * 2;
      const maxH = pageH - verticalMargin * 2;

      let imgW = maxW;
      let imgH = imgW / imgAspect;

      // If card is too tall, scale by height instead
      if (imgH > maxH) {
        imgH = maxH;
        imgW = imgH * imgAspect;
      }

      // Center on page
      const x = (pageW - imgW) / 2;
      const y = (pageH - imgH) / 2;

      // Add card image
      pdf.addImage(imgData, 'PNG', x, y, imgW, imgH);

      // Save
      pdf.save(`JagranEcoFest-Pass-${appState.name || 'Student'}.pdf`);

      btn.innerHTML = '<i class="fa-solid fa-check"></i> Downloaded!';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-download"></i> Download Pass';
        btn.disabled = false;
      }, 2000);
    } catch (err) {
      console.error('Download error:', err);
      btn.innerHTML = '<i class="fa-solid fa-download"></i> Try Again';
      btn.disabled = false;
      showToast('Could not generate pass. Try taking a screenshot instead.');
    }
  }



  /* ------------------------------------------------------------------
     FETCH — GET (check registration status)
  ------------------------------------------------------------------ */
  async function checkRegistrationStatus(name, batch) {
    try {
      const params = new URLSearchParams({ name, batch });
      const url    = `${APPS_SCRIPT_URL}?${params.toString()}`;
      const res    = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (parseErr) {
        console.error('GET JSON parse error:', parseErr, 'Raw:', text);
        return { status: 'new_user' }; // Fail open
      }
    } catch (err) {
      console.error('GET fetch error:', err);
      return { status: 'new_user' }; // Fail open on network error
    }
  }

  /* ------------------------------------------------------------------
     FETCH — POST (submit registration)
  ------------------------------------------------------------------ */
  async function submitRegistration(data) {
    const res = await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('POST JSON parse error:', parseErr, 'Raw:', text);
      throw new Error('Invalid response from server. Please try again.');
    }
  }

  /* ------------------------------------------------------------------
     HELPERS
  ------------------------------------------------------------------ */
  function formatDate(date) {
    const d = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${date.getDate()} ${d[date.getMonth()]} ${date.getFullYear()}`;
  }

  /* ------------------------------------------------------------------
     KEYBOARD — Enter to advance
  ------------------------------------------------------------------ */
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    const s = appState.currentScreen;
    if (s === 's1') startApp();
    else if (s === 's2') continueFromS2();
    else if (s === 's3') continueFromS3();
    else if (s === 's4') continueFromS4();
    else if (s === 's5') submitEntry();
  });


