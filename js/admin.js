/* ============================================================
   JAGRAN ECO FEST — ADMIN DASHBOARD JS
   ============================================================
   Reference: CLAUDE.md Section 17
   CSS:       css/admin-style.css
   Backend:   backend/Code.gs (admin endpoints)
   ============================================================ */

/* ------------------------------------------------------------------
   APPS SCRIPT URL — same as main app
   ------------------------------------------------------------------ */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzdw1iWl0-CmJ1wqFpVpydd-sNrlZ14FFmbrWcizOEwnLKYMVehyNbbrkr4Rxis9hOWw/exec';

/* ------------------------------------------------------------------
   STATE
   ------------------------------------------------------------------ */
const adminState = {
  authenticated: false,
  password: '',
  currentTab: 'dashboard',

  // Dashboard
  stats: null,
  recentRows: [],

  // Registrations
  registrations: [],
  totalRegistrations: 0,
  currentPage: 1,
  perPage: 50,
  totalPages: 0,
  searchQuery: '',
  competitionFilter: 'all',
  batchFilter: 'all',
  sortColumn: 'timestamp',
  sortDirection: 'desc',

  // Detail modal
  selectedRow: null,
  selectedRowIndex: null,

  // Delete
  deleteRowIndex: null,
  deleteName: '',
  deleteBatch: '',
  deleteTimestamp: '',

  // Debounce timer
  searchTimer: null,
  lastSearchValue: '',

  // Loading
  isLoading: false,
};

/* ------------------------------------------------------------------
   ADMIN FETCH HELPERS
   ------------------------------------------------------------------ */

/**
 * Make a GET admin request.
 */
async function adminGet(action, extraParams) {
  if (!extraParams) extraParams = {};
  var params = {
    mode: 'admin',
    action: action,
  };
  // Only include password if already authenticated (avoid empty password= in URL on login)
  if (adminState.password) {
    params.password = adminState.password;
  }
  // Merge extraParams (overwrites any duplicate keys)
  for (var key in extraParams) {
    if (extraParams.hasOwnProperty(key)) {
      params[key] = extraParams[key];
    }
  }
  var qs = new URLSearchParams(params).toString();
  var url = APPS_SCRIPT_URL + '?' + qs;
  var res = await fetch(url);
  var text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('adminGet parse error:', text);
    throw new Error('Invalid response from server');
  }
}

/**
 * Make an admin request using GET with query parameters.
 * Google Apps Script blocks POST CORS from localhost — GET works.
 * All data is passed as URL query params (flat key-value pairs).
 */
async function adminPost(action, data) {
  if (!data) data = {};
  var params = {
    mode: 'admin',
    action: action,
  };
  // Only include password if already authenticated
  if (adminState.password) {
    params.password = adminState.password;
  }
  // Merge data into params (flat key-value pairs only)
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      params[key] = data[key];
    }
  }
  var qs = new URLSearchParams(params).toString();
  var url = APPS_SCRIPT_URL + '?' + qs;
  var res = await fetch(url);
  var text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('adminPost parse error:', text);
    throw new Error('Invalid response from server');
  }
}

/* ------------------------------------------------------------------
   PASSWORD VISIBILITY TOGGLE
   ------------------------------------------------------------------ */
function togglePasswordVisibility(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  var isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.querySelector('i').className = isPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}

/* ------------------------------------------------------------------
   LOGIN
   ------------------------------------------------------------------ */
async function handleLogin(event) {
  event.preventDefault();
  const input = document.getElementById('loginPassword');
  const error = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  const password = input.value.trim();

  if (!password) {
    error.classList.remove('hidden');
    error.querySelector('span').textContent = 'Please enter a password.';
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying\u2026';
  error.classList.add('hidden');

  try {
    const res = await adminGet('auth', { password: password });
    if (res.status === 'authenticated') {
      adminState.authenticated = true;
      adminState.password = password;
      showAdminApp();
    } else {
      error.classList.remove('hidden');
      error.querySelector('span').textContent = 'Invalid password. Please try again.';
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> Unlock Dashboard';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.classList.remove('hidden');
    error.querySelector('span').textContent = 'Network error. Check your connection and try again.';
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> Unlock Dashboard';
  }
}

function showAdminApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');
  loadDashboard();
}

function handleLogout() {
  adminState.authenticated = false;
  adminState.password = '';
  document.getElementById('adminApp').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').classList.add('hidden');
  document.getElementById('loginBtn').disabled = false;
  document.getElementById('loginBtn').innerHTML = '<i class="fa-solid fa-unlock-keyhole"></i> Unlock Dashboard';
  showAdminToast('Logged out successfully');
}

/* ------------------------------------------------------------------
   TAB NAVIGATION
   ------------------------------------------------------------------ */
function adminNavigate(tab) {
  document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
  var tabEl = document.querySelector('.admin-tab[data-tab="' + tab + '"]');
  if (tabEl) tabEl.classList.add('active');

  document.querySelectorAll('.admin-panel').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById('panel-' + tab);
  if (panel) panel.classList.add('active');

  adminState.currentTab = tab;

  // Load data on tab switch
  if (tab === 'dashboard') loadDashboard();
  else if (tab === 'registrations') loadRegistrations(1);
  else if (tab === 'settings') loadSettings();
}

function refreshCurrentTab() {
  adminNavigate(adminState.currentTab);
}

/* ------------------------------------------------------------------
   TOAST & LOADING
   ------------------------------------------------------------------ */
function showAdminToast(message, type) {
  if (!type) type = 'success';
  var container = document.getElementById('adminToastContainer');
  var toast = document.createElement('div');
  toast.className = 'admin-toast' + (type === 'error' ? ' error' : '');
  toast.innerHTML = '<i class="fa-solid ' + (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check') + '"></i>' +
    '<span class="toast-message">' + message + '</span>';
  container.appendChild(toast);

  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() { toast.remove(); }, 350);
  }, 4000);
}

function showLoadingOverlay(message) {
  if (!message) message = 'Loading\u2026';
  document.getElementById('loadingOverlayText').textContent = message;
  document.getElementById('loadingOverlay').classList.remove('hidden');
  adminState.isLoading = true;
}

function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').classList.add('hidden');
  adminState.isLoading = false;
}

/* ------------------------------------------------------------------
   A2 \u2014 DASHBOARD
   ------------------------------------------------------------------ */
async function loadDashboard() {
  try {
    var res = await adminGet('stats');
    if (res.status === 'success' && res.data) {
      adminState.stats = res.data;
      renderStatsCards(res.data);
      renderTrendChart(res.data.registrationsByDate || []);
      await loadRecentRegistrations();
    } else {
      showAdminToast('Failed to load dashboard stats', 'error');
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    showAdminToast('Network error loading dashboard', 'error');
  }
}

function renderStatsCards(stats) {
  var grid = document.getElementById('statsGrid');
  grid.innerHTML = '';

  var cards = [
    { icon: 'fa-users',      label: 'Total Registrations', value: stats.totalRegistrations || 0, variant: 'primary' },
    { icon: 'fa-palette',    label: 'Poster & Slogan',     value: stats.posterCount || 0,        variant: 'accent' },
    { icon: 'fa-brain',      label: 'Quiz Competition',    value: stats.quizCount || 0,          variant: 'secondary' },
    { icon: 'fa-star',       label: 'Both Competitions',   value: stats.bothCount || 0,          variant: 'amber' },
  ];

  cards.forEach(function(c, idx) {
    var card = document.createElement('div');
    card.className = 'stat-card stagger-' + (idx + 1);
    card.innerHTML = '<div class="stat-card-icon stat-icon-' + c.variant + '">' +
      '<i class="fa-solid ' + c.icon + '"></i></div>' +
      '<div class="stat-card-body">' +
      '<div class="stat-card-number" data-target="' + c.value + '">0</div>' +
      '<div class="stat-card-label">' + c.label + '</div></div>';
    grid.appendChild(card);
  });

  // Animate count-up
  setTimeout(function() {
    grid.querySelectorAll('.stat-card-number[data-target]').forEach(function(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      animateCountUp(el, target, 600);
    });
  }, 100);

  // Second row with count-up
  var grid2 = document.getElementById('statsGrid2');
  var teamCount = stats.teamCount || 0;
  var todayCount = stats.todayCount || 0;
  var weeklyCount = stats.weeklyCount || 0;

  grid2.innerHTML =
    '<div class="stat-card-wide stagger-1">' +
      '<div class="stat-card-icon stat-icon-surface" style="width:48px;height:48px;border-radius:14px;">' +
        '<i class="fa-solid fa-people-group"></i></div>' +
      '<div>' +
        '<div class="stat-card-number" data-target="' + teamCount + '">0</div>' +
        '<div class="stat-card-label">Quiz Teams</div>' +
        '<div class="stat-card-sub"><i class="fa-solid fa-users"></i> Unique teams registered</div></div></div>' +
    '<div class="stat-card-wide stagger-2">' +
      '<div class="stat-card-icon stat-icon-surface" style="width:48px;height:48px;border-radius:14px;">' +
        '<i class="fa-solid fa-calendar-day"></i></div>' +
      '<div>' +
        '<div class="stat-card-number">' +
          '<span data-target="' + todayCount + '" class="count-up-target">0</span>' +
          ' <span style="font-size:14px;color:var(--secondary);font-family:DM Sans,sans-serif;">/ ' + weeklyCount + '</span></div>' +
        '<div class="stat-card-label">Today / This Week</div>' +
        '<div class="stat-card-sub"><i class="fa-solid fa-clock"></i> New registrations today &amp; this week</div></div></div>';

  // Animate second row count-up
  setTimeout(function() {
    grid2.querySelectorAll('.stat-card-number[data-target]').forEach(function(el) {
      animateCountUp(el, parseInt(el.getAttribute('data-target'), 10), 600);
    });
    grid2.querySelectorAll('.count-up-target').forEach(function(el) {
      animateCountUp(el, parseInt(el.getAttribute('data-target'), 10), 600);
    });
  }, 200);
}

function renderTrendChart(data) {
  var chart = document.getElementById('trendChart');
  if (!data || data.length === 0) {
    chart.innerHTML = '<div class="trend-empty"><i class="fa-solid fa-chart-line"></i><span>No registration data yet</span></div>';
    return;
  }

  var maxCount = Math.max.apply(null, data.map(function(d) { return d.count; }).concat([1]));
  chart.innerHTML = '';

  data.forEach(function(d) {
    var height = Math.max((d.count / maxCount) * 100, 4);
    var barWrap = document.createElement('div');
    barWrap.className = 'trend-bar-wrap';
    barWrap.innerHTML =
      '<div class="trend-bar" style="height:' + height + '%">' +
        '<span class="trend-bar-count">' + d.count + '</span></div>' +
      '<span class="trend-bar-label">' + formatDateLabel(d.date) + '</span>';
    chart.appendChild(barWrap);
  });
}

function formatDateLabel(dateStr) {
  var parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var m = parseInt(parts[1], 10) - 1;
  var d = parseInt(parts[2], 10);
  return d + ' ' + (months[m] || '');
}

async function loadRecentRegistrations() {
  try {
    var res = await adminGet('registrations', {
      page: 1,
      perPage: 5,
      sortColumn: 'timestamp',
      sortDirection: 'desc',
    });
    if (res.status === 'success' && res.data) {
      adminState.recentRows = res.data.rows || [];
      renderRecentTable(adminState.recentRows);
    }
  } catch (err) {
    console.error('Recent load error:', err);
    document.getElementById('recentBody').innerHTML = '<tr><td colspan="4" class="recent-empty">Could not load recent entries</td></tr>';
  }
}

/* Count-up animation helper */
function animateCountUp(el, target, duration) {
  var startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.floor(eased * target);
    el.textContent = current;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }
  requestAnimationFrame(step);
}

function renderRecentTable(rows) {
  var tbody = document.getElementById('recentBody');
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="recent-empty">No registrations yet</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function(r) {
    var compClass = getCompClass(r.competition);
    return '<tr>' +
      '<td data-label="Name"><strong>' + escapeHtml(r.name) + '</strong></td>' +
      '<td data-label="Batch">' + escapeHtml(r.batch) + '</td>' +
      '<td data-label="Competition" class="badge-cell"><span class="chip-mini ' + compClass + '">' + getCompShort(r.competition) + '</span></td>' +
      '<td data-label="Time" class="time-cell">' + formatTimestamp(r.timestamp) + '</td></tr>';
  }).join('');
}

/* ------------------------------------------------------------------
   A3 \u2014 REGISTRATIONS TABLE
   ------------------------------------------------------------------ */
async function loadRegistrations(page) {
  adminState.currentPage = page || adminState.currentPage;

  try {
    var res = await adminGet('registrations', {
      page: adminState.currentPage,
      perPage: adminState.perPage,
      search: adminState.searchQuery,
      competition: adminState.competitionFilter,
      batch: adminState.batchFilter,
      sortColumn: adminState.sortColumn,
      sortDirection: adminState.sortDirection,
    });

    if (res.status === 'success' && res.data) {
      adminState.registrations = res.data.rows || [];
      adminState.totalRegistrations = res.data.total || 0;
      adminState.totalPages = res.data.totalPages || 0;
      renderRegistrationsTable();
      renderPagination();
      renderResultsSummary();
      populateBatchFilter(adminState.registrations, res.data.total);
    } else {
      showAdminToast('Failed to load registrations', 'error');
    }
  } catch (err) {
    console.error('Registrations load error:', err);
    showAdminToast('Network error loading registrations', 'error');
  }
}

function renderRegistrationsTable() {
  var tbody = document.getElementById('registrationsBody');
  var rows = adminState.registrations;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">' +
      '<div class="table-empty">' +
        '<i class="fa-solid fa-inbox"></i>' +
        '<p>No registrations match your filters.</p>' +
        '<span class="clear-link" onclick="clearFilters()">Clear filters</span>' +
      '</div></td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(function(r) {
    var compClass = getCompClass(r.competition);
    var compLabel = getCompLabel(r.competition);
    var safeName = escapeHtml(r.name);
    var safeBatch = escapeHtml(r.batch);
    var safeTeam = escapeHtml(r.teamName) || '\u2014';
    var ts = formatTimestamp(r.timestamp);
    var safeNameAttr = escapeHtmlAttr(r.name);
    var safeBatchAttr = escapeHtmlAttr(r.batch);
    var safeTsAttr = escapeHtmlAttr(String(r.timestamp instanceof Date ? r.timestamp.toISOString() : (r.timestamp || '')));

    return '<tr data-rowindex="' + r.sheetRowIndex + '" onclick="openDetailFromRow(this)" style="cursor:pointer;">' +
      '<td data-label="Name"><span class="name-cell">' + safeName + '</span></td>' +
      '<td data-label="Batch">' + safeBatch + '</td>' +
      '<td data-label="Competition"><span class="chip-mini ' + compClass + '">' + compLabel + '</span></td>' +
      '<td data-label="Team">' + safeTeam + '</td>' +
      '<td data-label="Registered" class="time-cell">' + ts + '</td>' +
      '<td data-label="Actions" class="action-cell" onclick="event.stopPropagation()">' +
        '<div class="action-btn-group">' +
          '<button class="table-action-link view-btn" data-rowindex="' + r.sheetRowIndex + '" onclick="openDetailFromBtn(this)" title="View details">' +
            '<i class="fa-solid fa-eye"></i> View' +
          '</button>' +
          '<button class="table-action-link danger delete-btn" data-rowindex="' + r.sheetRowIndex + '" data-name="' + safeNameAttr + '" data-batch="' + safeBatchAttr + '" data-timestamp="' + safeTsAttr + '" onclick="openDeleteFromBtn(this)" title="Delete registration">' +
            '<i class="fa-solid fa-trash"></i>' +
          '</button>' +
        '</div>' +
      '</td></tr>';
  }).join('');
}

function renderResultsSummary() {
  var el = document.getElementById('resultsSummary');
  var total = adminState.totalRegistrations;
  var page = adminState.currentPage;
  var perPage = adminState.perPage;
  var start = total === 0 ? 0 : (page - 1) * perPage + 1;
  var end = Math.min(page * perPage, total);

  if (total === 0) {
    el.innerHTML = 'No registrations found.';
  } else {
    el.innerHTML = 'Showing <strong>' + start + '\u2013' + end + '</strong> of <strong>' + total + '</strong> registrations';
  }
}

function renderPagination() {
  var pagination = document.getElementById('pagination');
  var info = document.getElementById('paginationInfo');
  var total = adminState.totalRegistrations;
  var current = adminState.currentPage;
  var totalPages = adminState.totalPages;

  info.textContent = 'Page ' + current + ' of ' + (totalPages || 1) + ' (' + total + ' total)';

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  var html = '';

  // Prev
  html += '<button class="page-btn" onclick="loadRegistrations(' + (current - 1) + ')" ' + (current <= 1 ? 'disabled' : '') + '>' +
    '<i class="fa-solid fa-chevron-left"></i></button>';

  var range = 2;
  var startPage = Math.max(1, current - range);
  var endPage = Math.min(totalPages, current + range);

  if (startPage > 1) {
    html += '<button class="page-btn" onclick="loadRegistrations(1)">1</button>';
    if (startPage > 2) html += '<button class="page-btn" disabled>\u2026</button>';
  }

  for (var i = startPage; i <= endPage; i++) {
    html += '<button class="page-btn' + (i === current ? ' active' : '') + '" onclick="loadRegistrations(' + i + ')">' + i + '</button>';
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += '<button class="page-btn" disabled>\u2026</button>';
    html += '<button class="page-btn" onclick="loadRegistrations(' + totalPages + ')">' + totalPages + '</button>';
  }

  // Next
  html += '<button class="page-btn" onclick="loadRegistrations(' + (current + 1) + ')" ' + (current >= totalPages ? 'disabled' : '') + '>' +
    '<i class="fa-solid fa-chevron-right"></i></button>';

  pagination.innerHTML = html;
}

/* ------------------------------------------------------------------
   SEARCH + FILTER
   ------------------------------------------------------------------ */
function handleSearchInput() {
  clearTimeout(adminState.searchTimer);
  var val = document.getElementById('searchInput').value.trim();
  adminState.searchTimer = setTimeout(function() {
    if (val !== adminState.lastSearchValue) {
      adminState.searchQuery = val;
      adminState.lastSearchValue = val;
      loadRegistrations(1);
    }
  }, 350);
}

function handleFilterChange() {
  adminState.competitionFilter = document.getElementById('compFilter').value;
  adminState.batchFilter = document.getElementById('batchFilter').value;
  loadRegistrations(1);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('compFilter').value = 'all';
  document.getElementById('batchFilter').value = 'all';
  adminState.searchQuery = '';
  adminState.competitionFilter = 'all';
  adminState.batchFilter = 'all';
  adminState.lastSearchValue = '';
  loadRegistrations(1);
}

function handlePerPageChange() {
  adminState.perPage = parseInt(document.getElementById('perPageSelect').value, 10);
  loadRegistrations(1);
}

function populateBatchFilter(rows, total) {
  var select = document.getElementById('batchFilter');
  var currentVal = select.value;

  adminGet('registrations', {
    page: 1,
    perPage: 10000,
    sortColumn: 'batch',
    sortDirection: 'asc',
  }).then(function(res) {
    if (res.status === 'success' && res.data && res.data.rows) {
      var batchSet = {};
      res.data.rows.forEach(function(r) {
        if (r.batch && r.batch.trim()) batchSet[r.batch.trim()] = true;
      });
      var batches = Object.keys(batchSet).sort();
      select.innerHTML = '<option value="all">All Batches</option>' +
        batches.map(function(b) { return '<option value="' + escapeHtmlAttr(b) + '">' + escapeHtml(b) + '</option>'; }).join('');
      select.value = currentVal;
    }
  }).catch(function() {});
}

/* ------------------------------------------------------------------
   SORTING
   ------------------------------------------------------------------ */
function handleSort(column) {
  if (adminState.sortColumn === column) {
    adminState.sortDirection = adminState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    adminState.sortColumn = column;
    adminState.sortDirection = 'asc';
  }

  document.querySelectorAll('.admin-table th').forEach(function(th) {
    th.classList.remove('sorted-asc', 'sorted-desc');
    // Reset all sort icons to default
    var icon = th.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-arrow-up-short-wide';
    }
  });
  var th = document.querySelector('.admin-table th[data-sort="' + column + '"]');
  if (th) {
    th.classList.add('sorted-' + adminState.sortDirection);
    // Update the icon to show direction
    var icon = th.querySelector('i');
    if (icon) {
      icon.className = adminState.sortDirection === 'asc'
        ? 'fa-solid fa-arrow-up-wide-short'
        : 'fa-solid fa-arrow-down-short-wide';
    }
  }

  loadRegistrations(1);
}

/* ------------------------------------------------------------------
   A4 \u2014 DETAIL MODAL
   ------------------------------------------------------------------ */
async function openDetailModal(rowIndex) {
  try {
    var res = await adminGet('detail', { rowIndex: rowIndex });
    if (res.status === 'success' && res.data) {
      adminState.selectedRow = res.data;
      adminState.selectedRowIndex = rowIndex;
      renderDetailModal(res.data);
      document.getElementById('detailBackdrop').classList.remove('hidden');
      document.getElementById('detailModal').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      showAdminToast('Could not load registration details', 'error');
    }
  } catch (err) {
    console.error('Detail load error:', err);
    showAdminToast('Network error loading details', 'error');
  }
}

function renderDetailModal(data) {
  document.getElementById('detailName').textContent = data.name || '\u2014';

  var chipRow = document.getElementById('detailChipRow');
  var compClass = getCompClass(data.competition);
  chipRow.innerHTML = '<span class="detail-chip ' + compClass + '">' + getCompLabel(data.competition) + '</span>';

  document.getElementById('detailFullName').textContent = data.name || '\u2014';
  document.getElementById('detailBatch').textContent = data.batch || '\u2014';
  document.getElementById('detailComp').textContent = getCompLabel(data.competition);

  var teamRow = document.getElementById('detailTeamRow');
  if (data.hasTeam && data.teamName && data.teamName !== '-') {
    teamRow.classList.remove('hidden');
    document.getElementById('detailTeamName').textContent = data.teamName;
  } else {
    teamRow.classList.add('hidden');
  }

  document.getElementById('detailTime').textContent = formatTimestamp(data.timestamp);

  // Team section
  var teamSection = document.getElementById('detailTeamSection');
  var teamMembers = document.getElementById('detailTeamMembers');
  if (data.hasTeam && data.teamName && data.teamName !== '-') {
    teamSection.classList.remove('hidden');
    var html = '';

    html += '<div class="team-member-row">' +
      '<span class="team-member-role"><i class="fa-solid fa-crown" style="color:var(--amber);"></i> Captain</span>' +
      '<span class="team-member-name">' + escapeHtml(data.name) + '</span>' +
      '<span class="team-member-batch">' + escapeHtml(data.batch) + '</span></div>';

    if (data.m2name && data.m2name !== '-') {
      html += '<div class="team-member-row">' +
        '<span class="team-member-role"><i class="fa-solid fa-user"></i> Member 2</span>' +
        '<span class="team-member-name">' + escapeHtml(data.m2name) + '</span>' +
        '<span class="team-member-batch">' + escapeHtml(data.m2batch || '') + '</span></div>';
    }

    if (data.m3name && data.m3name !== '-') {
      html += '<div class="team-member-row">' +
        '<span class="team-member-role"><i class="fa-solid fa-user"></i> Member 3</span>' +
        '<span class="team-member-name">' + escapeHtml(data.m3name) + '</span>' +
        '<span class="team-member-batch">' + escapeHtml(data.m3batch || '') + '</span></div>';
    }

    teamMembers.innerHTML = html;
  } else {
    teamSection.classList.add('hidden');
  }
}

function closeDetailModal() {
  document.getElementById('detailBackdrop').classList.add('hidden');
  document.getElementById('detailModal').classList.add('hidden');
  document.body.style.overflow = '';
  adminState.selectedRow = null;
}

function printDetailCard() {
  window.print();
}

/* ------------------------------------------------------------------
   DELETE REGISTRATION
   ------------------------------------------------------------------ */
function openDeleteConfirm(rowIndex, name, batch, timestamp) {
  adminState.deleteRowIndex = rowIndex;
  adminState.deleteName = name;
  adminState.deleteBatch = batch || '';
  adminState.deleteTimestamp = timestamp || '';
  document.getElementById('deleteName').textContent = name;
  document.getElementById('deleteBackdrop').classList.remove('hidden');
  document.getElementById('deleteModal').classList.remove('hidden');
}

function openDeleteConfirmFromDetail() {
  if (adminState.selectedRow && adminState.selectedRowIndex) {
    var ts = adminState.selectedRow.timestamp instanceof Date
      ? adminState.selectedRow.timestamp.toISOString()
      : String(adminState.selectedRow.timestamp || '');
    openDeleteConfirm(
      adminState.selectedRowIndex,
      adminState.selectedRow.name,
      adminState.selectedRow.batch,
      ts
    );
  }
}

function closeDeleteConfirm() {
  document.getElementById('deleteBackdrop').classList.add('hidden');
  document.getElementById('deleteModal').classList.add('hidden');
  adminState.deleteRowIndex = null;
  adminState.deleteName = '';
  adminState.deleteBatch = '';
  adminState.deleteTimestamp = '';
}

async function confirmDelete() {
  var rowIndex = adminState.deleteRowIndex;
  var name = adminState.deleteName;
  var batch = adminState.deleteBatch;
  var timestamp = adminState.deleteTimestamp;
  if (!rowIndex) return;

  var btn = document.getElementById('confirmDeleteBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting\u2026';

  try {
    // Use composite key (name + batch + timestamp) for robust identification
    var res = await adminPost('delete', {
      rowIndex: rowIndex,
      name: name,
      batch: batch,
      timestamp: timestamp
    });
    if (res.status === 'success') {
      showAdminToast('Deleted registration for ' + name);
      closeDeleteConfirm();
      closeDetailModal();
      loadRegistrations(adminState.currentPage);
    } else {
      showAdminToast(res.message || 'Failed to delete', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-trash"></i> Yes, Delete';
    }
  } catch (err) {
    console.error('Delete error:', err);
    showAdminToast('Network error during delete', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-trash"></i> Yes, Delete';
  }
}

/* ------------------------------------------------------------------
   EXPORT
   ------------------------------------------------------------------ */
function triggerExport() {
  adminNavigate('export');
}

async function handleExport() {
  var format = (document.querySelector('input[name="exportFormat"]:checked') || {}).value || 'csv';
  var comp = (document.querySelector('input[name="exportComp"]:checked') || {}).value || 'all';

  if (format === 'csv') {
    downloadExportCSV(comp);
  } else if (format === 'pdf') {
    downloadExportPDF(comp);
  }
}

function downloadExportCSV(comp) {
  var params = new URLSearchParams({
    mode: 'admin',
    action: 'export',
    password: adminState.password,
    format: 'csv',
    competition: comp,
  });
  var url = APPS_SCRIPT_URL + '?' + params.toString();

  var a = document.createElement('a');
  a.href = url;
  a.download = 'JagranEcoFest-Registrations.csv';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showAdminToast('Downloading CSV file\u2026');
}

async function downloadExportPDF(comp) {
  showLoadingOverlay('Preparing PDF export\u2026');
  try {
    var res = await adminGet('registrations', {
      page: 1,
      perPage: 10000,
      competition: comp,
      sortColumn: 'timestamp',
      sortDirection: 'desc',
    });
    hideLoadingOverlay();

    if (res.status !== 'success' || !res.data) {
      showAdminToast('Failed to fetch registration data', 'error');
      return;
    }

    var filtered = res.data.rows || [];

    if (filtered.length === 0) {
      showAdminToast('No registrations to export', 'error');
      return;
    }

    var includeBasic      = document.getElementById('exportBasic').checked;
    var includeTeam       = document.getElementById('exportTeam').checked;
    var includeTimestamps = document.getElementById('exportTimestamps').checked;

    showLoadingOverlay('Generating PDF\u2026');

    // ── Build individual card HTMLs ──────────────────────────────────────────
    // Each card is compact (~490px tall) so 2 fit on one A4 page (1123px).
    // html2canvas constraints: NO display:table, NO CSS vars, NO off-screen.
    // Overlay is opacity:0 — invisible to user, visible to html2canvas.
    // ─────────────────────────────────────────────────────────────────────────

    var cards = [];

    filtered.forEach(function(r, idx) {
      var compLabel = (function(c) {
        c = (c || '').toLowerCase();
        if (c.indexOf('both')   !== -1) return 'Both Competitions';
        if (c.indexOf('poster') !== -1) return 'Poster & Slogan Making';
        if (c.indexOf('quiz')   !== -1) return 'Quiz Competition';
        return r.competition || '\u2014';
      })(r.competition);

      var compColor = (function(c) {
        c = (c || '').toLowerCase();
        if (c.indexOf('both')   !== -1) return '#6B3FA0';
        if (c.indexOf('poster') !== -1) return '#C4874A';
        if (c.indexOf('quiz')   !== -1) return '#2D5A27';
        return '#2D5A27';
      })(r.competition);

      // Timestamp
      var timestampStr = '5 June 2026';
      if (includeTimestamps && r.timestamp) {
        try {
          var d = new Date(r.timestamp);
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          timestampStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        } catch(e) {}
      }

      // ── Build label-value rows (matches confirm-card style) ─────────────
      var rowsHtml = '';
      if (includeBasic) {
        rowsHtml =
          '<div style="padding:8px 0;border-bottom:1px solid rgba(196,135,74,0.1);overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Name</span>' +
            '<span style="float:right;font-size:14px;font-weight:600;color:#2C1810;text-align:right;width:calc(100% - 120px);">' + (r.name || '\u2014') + '</span>' +
          '</div>' +
          '<div style="padding:8px 0;border-bottom:1px solid rgba(196,135,74,0.1);overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Batch</span>' +
            '<span style="float:right;font-size:14px;font-weight:600;color:#2C1810;text-align:right;width:calc(100% - 120px);">' + (r.batch || '\u2014') + '</span>' +
          '</div>' +
          '<div style="padding:8px 0;border-bottom:1px solid rgba(196,135,74,0.1);overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Competition</span>' +
            '<span style="float:right;text-align:right;width:calc(100% - 120px);">' +
              '<span style="display:inline-block;background:' + compColor + ';color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:99px;">' + compLabel + '</span>' +
            '</span>' +
          '</div>';
      }

      // Team members — inline rows (matches confirm-card row style)
      if (includeTeam && r.teamName && r.teamName !== '-') {
        rowsHtml +=
          '<div style="padding:8px 0;border-bottom:1px solid rgba(196,135,74,0.1);overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Team</span>' +
            '<span style="float:right;font-size:14px;font-weight:600;color:#2C1810;text-align:right;width:calc(100% - 120px);">' + r.teamName + '</span>' +
          '</div>' +
          '<div style="padding:8px 0;border-bottom:1px solid rgba(196,135,74,0.1);overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Captain</span>' +
            '<span style="float:right;font-size:13px;font-weight:600;color:#2C1810;text-align:right;width:calc(100% - 120px);">' + (r.name || '') + ' <span style="color:#8B6914;font-size:11px;">(' + (r.batch || '') + ')</span></span>' +
          '</div>';
        if (r.m2name && r.m2name !== '-') {
          rowsHtml +=
          '<div style="padding:8px 0;border-bottom:1px solid rgba(196,135,74,0.1);overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Member 2</span>' +
            '<span style="float:right;font-size:13px;font-weight:600;color:#2C1810;text-align:right;width:calc(100% - 120px);">' + r.m2name + (r.m2batch && r.m2batch !== '-' ? ' <span style="color:#8B6914;font-size:11px;">(' + r.m2batch + ')</span>' : '') + '</span>' +
          '</div>';
        }
        if (r.m3name && r.m3name !== '-') {
          rowsHtml +=
          '<div style="padding:8px 0;overflow:hidden;">' +
            '<span style="float:left;font-size:12px;color:#8B6914;font-weight:500;width:110px;">Member 3</span>' +
            '<span style="float:right;font-size:13px;font-weight:600;color:#2C1810;text-align:right;width:calc(100% - 120px);">' + r.m3name + (r.m3batch && r.m3batch !== '-' ? ' <span style="color:#8B6914;font-size:11px;">(' + r.m3batch + ')</span>' : '') + '</span>' +
          '</div>';
        }
      }

      // ── Card HTML — matches app's confirm-card design ────────────────────
      // White bg, 8px green gradient band, leaf icon header, dashed dividers,
      // label-value rows, "Entry Confirmed" footer, leaf watermark
      var leafSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="position:absolute;bottom:8px;right:8px;width:60px;height:60px;opacity:0.06;"><path d="M50 10 C20 10 5 40 10 70 C30 50 70 50 90 70 C95 40 80 10 50 10Z" fill="#2D5A27"/></svg>';

      var cardHtml =
        '<div style="width:714px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(45,90,39,0.10);position:relative;">' +

        // Leaf watermark
        leafSvg +

        // 8px green gradient top band
        '<div style="height:8px;background:linear-gradient(90deg,#2D5A27,#5BA54E);"></div>' +

        // Header — leaf icon + event info (matches confirm-card-head)
        '<div style="padding:14px 20px 10px;border-bottom:1px dashed rgba(196,135,74,0.4);overflow:hidden;">' +
          '<div style="float:left;width:28px;padding-top:2px;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="width:24px;height:24px;"><path d="M50 10 C20 10 5 40 10 70 C30 50 70 50 90 70 C95 40 80 10 50 10Z" fill="#2D5A27"/></svg>' +
          '</div>' +
          '<div style="float:left;width:calc(100% - 36px);">' +
            '<div style="font-family:Playfair Display,serif;font-size:15px;color:#2C1810;font-weight:600;line-height:1.3;">World Environment Day 2026</div>' +
            '<div style="font-size:11px;color:#8B6914;line-height:1.3;">Jagran College of Arts, Science &amp; Commerce</div>' +
          '</div>' +
          '<div style="float:right;text-align:right;padding-top:2px;">' +
            '<span style="display:inline-block;background:rgba(45,90,39,0.08);color:#2D5A27;font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;letter-spacing:0.5px;">#' + String(idx + 1).padStart(3, '0') + '</span>' +
          '</div>' +
        '</div>' +

        // Body — label-value rows (matches confirm-card-body)
        '<div style="padding:10px 20px;">' +
        rowsHtml +
        '</div>' +

        // Footer — Entry Confirmed + timestamp (matches confirm-card-footer)
        '<div style="padding:10px 20px 14px;border-top:1px dashed rgba(196,135,74,0.4);overflow:hidden;">' +
          '<span style="float:left;font-size:13px;font-weight:700;color:#2D5A27;">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width:12px;height:12px;vertical-align:-1px;margin-right:4px;"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" fill="#2D5A27"/></svg>' +
            'Entry Confirmed' +
          '</span>' +
          '<span style="float:right;font-size:11px;color:#8B6914;text-align:right;">' + timestampStr + '</span>' +
        '</div>' +

        '</div>';

      cards.push(cardHtml);
    });

    // ── Lazy-load html2canvas ────────────────────────────────────────────────
    if (typeof html2canvas === 'undefined') {
      await new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    // ── Lazy-load jsPDF ──────────────────────────────────────────────────────
    if (typeof window.jspdf === 'undefined') {
      await new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    // ── Rendering overlay — hidden behind the loading overlay (z-index:999) ───
    // html2canvas needs the element at full opacity and in-viewport to render.
    // The loading overlay (z-index:999, full-screen dark backdrop) covers it.
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:794px;z-index:998;overflow:hidden;pointer-events:none;';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);

    var jsPDF = window.jspdf.jsPDF;
    // A4 landscape-ish px: 794 x 1123
    var PAGE_W = 794;
    var PAGE_H = 1123;
    var MARGIN_X = 40;
    var MARGIN_TOP = 30;
    var CARD_GAP = 18;

    var pdf = new jsPDF({ unit: 'px', format: [PAGE_W, PAGE_H], orientation: 'portrait', hotfixes: ['px_scaling'] });

    // ── Render 2 cards per page ──────────────────────────────────────────────
    var totalPages = Math.ceil(cards.length / 2);

    for (var page = 0; page < totalPages; page++) {
      showLoadingOverlay('Rendering page ' + (page + 1) + ' of ' + totalPages + '\u2026');

      var i1 = page * 2;
      var i2 = i1 + 1;
      var hasCard2 = i2 < cards.length;

      // Build page HTML with 2 cards stacked vertically
      var pageInner =
        '<div style="padding:' + MARGIN_TOP + 'px ' + MARGIN_X + 'px;box-sizing:border-box;">' +
        cards[i1];

      if (hasCard2) {
        pageInner += '<div style="height:' + CARD_GAP + 'px;"></div>' + cards[i2];
      }

      pageInner += '</div>';

      overlay.innerHTML = '<div style="width:' + PAGE_W + 'px;height:' + PAGE_H + 'px;background:#F5F0E8;position:relative;overflow:hidden;">' + pageInner + '</div>';

      // Wait for browser paint
      await new Promise(function(r) { setTimeout(r, 80); });

      // Capture full page
      var canvas = await html2canvas(overlay.firstElementChild, {
        scale: 2,
        width: PAGE_W,
        height: PAGE_H,
        backgroundColor: '#F5F0E8',
        useCORS: false,
        allowTaint: false,
        logging: false
      });

      var imgData = canvas.toDataURL('image/jpeg', 0.92);

      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_W, PAGE_H);
    }

    // Cleanup
    document.body.removeChild(overlay);

    showLoadingOverlay('Saving PDF\u2026');
    pdf.save('JagranEcoFest-Registrations.pdf');

    hideLoadingOverlay();
    showAdminToast('PDF downloaded \u2014 ' + filtered.length + ' student' + (filtered.length > 1 ? 's' : ''));

  } catch (err) {
    var staleOverlay = document.querySelector('div[style*="z-index:998"]');
    if (staleOverlay) staleOverlay.remove();
    hideLoadingOverlay();
    console.error('PDF export error:', err);
    showAdminToast('Failed to generate PDF', 'error');
  }
}

function resetExportOptions() {
  document.querySelectorAll('input[name="exportFormat"]').forEach(function(r) { r.checked = r.value === 'csv'; });
  document.querySelectorAll('input[name="exportComp"]').forEach(function(r) { r.checked = r.value === 'all'; });
  document.getElementById('exportBasic').checked = true;
  document.getElementById('exportTeam').checked = true;
  document.getElementById('exportTimestamps').checked = true;

}

/* ------------------------------------------------------------------
   SETTINGS
   ------------------------------------------------------------------ */
async function loadSettings() {
  try {
    var res = await adminGet('settings');
    if (res.status === 'success' && res.data) {
      if (res.data.eventName) document.getElementById('settingsEventName').value = res.data.eventName;
      if (res.data.eventDate) document.getElementById('settingsEventDate').value = res.data.eventDate;
      if (res.data.deadline) document.getElementById('settingsDeadline').value = res.data.deadline;
      if (res.data.tagline) document.getElementById('settingsTagline').value = res.data.tagline;
      if (res.data.collegeName) document.getElementById('settingsCollege').value = res.data.collegeName;
    }
  } catch (err) {
    console.error('Settings load error:', err);
  }
}

async function saveSettings() {
  var settings = {
    eventName: document.getElementById('settingsEventName').value.trim(),
    eventDate: document.getElementById('settingsEventDate').value.trim(),
    deadline: document.getElementById('settingsDeadline').value.trim(),
    tagline: document.getElementById('settingsTagline').value.trim(),
    collegeName: document.getElementById('settingsCollege').value.trim(),
  };

  // Include password if user entered one — flattened into top-level params
  var newPassword = document.getElementById('settingsPassword').value.trim();
  if (newPassword) {
    settings.adminPassword = newPassword;
  }

  showLoadingOverlay('Saving settings\u2026');

  try {
    // Pass settings fields directly (not nested) for GET query params
    var res = await adminPost('update-settings', settings);
    hideLoadingOverlay();
    if (res.status === 'success') {
      showAdminToast('Settings saved successfully');
      // Clear password field after successful save
      document.getElementById('settingsPassword').value = '';
    } else {
      showAdminToast(res.message || 'Failed to save settings', 'error');
    }
  } catch (err) {
    hideLoadingOverlay();
    console.error('Settings save error:', err);
    showAdminToast('Network error saving settings', 'error');
  }
}

function resetSettings() {
  document.getElementById('settingsEventName').value = 'World Environment Day 2026';
  document.getElementById('settingsEventDate').value = '5th June 2026';
  document.getElementById('settingsDeadline').value = '30 May 2026';
  document.getElementById('settingsTagline').value = 'Celebrate. Create. Conserve.';
  document.getElementById('settingsCollege').value = 'Jagran College of Arts, Science and Commerce';
  document.getElementById('settingsPassword').value = '';
  showAdminToast('Settings reset to defaults (not saved)');
}

/* ------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------ */
function getCompClass(competition) {
  var c = (competition || '').toLowerCase();
  if (c.indexOf('both') !== -1 || c === 'both competitions') return 'both';
  if (c.indexOf('poster') !== -1 || c === 'poster & slogan making') return 'poster';
  if (c.indexOf('quiz') !== -1 || c === 'quiz competition') return 'quiz';
  return 'poster';
}

function getCompLabel(competition) {
  var c = (competition || '').toLowerCase();
  if (c.indexOf('both') !== -1) return 'Both';
  if (c.indexOf('poster') !== -1) return 'Poster';
  if (c.indexOf('quiz') !== -1) return 'Quiz';
  return competition || '\u2014';
}

function getCompShort(competition) {
  return getCompLabel(competition);
}

function formatTimestamp(ts) {
  if (!ts) return '\u2014';
  try {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return String(ts).split('T')[0] || '\u2014';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } catch (err) {
    return '\u2014';
  }
}

function escapeHtml(str) {
  if (!str) return '\u2014';
  var div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeHtmlAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* Helper: open delete confirm from button data-attributes */
function openDeleteFromBtn(btn) {
  var idx = parseInt(btn.getAttribute('data-rowindex'), 10);
  var name = btn.getAttribute('data-name') || '';
  var batch = btn.getAttribute('data-batch') || '';
  var ts = btn.getAttribute('data-timestamp') || '';
  if (!isNaN(idx)) {
    openDeleteConfirm(idx, name, batch, ts);
  }
}

/* Helper: open detail modal from row click using data-attribute */
function openDetailFromRow(row) {
  var idx = parseInt(row.getAttribute('data-rowindex'), 10);
  if (!isNaN(idx)) {
    openDetailModal(idx);
  }
}

/* Helper: open detail modal from button */
function openDetailFromBtn(btn) {
  var idx = parseInt(btn.getAttribute('data-rowindex'), 10);
  if (!isNaN(idx)) {
    openDetailModal(idx);
  }
}

/* ------------------------------------------------------------------
   KEYBOARD SHORTCUTS
   ------------------------------------------------------------------ */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (!document.getElementById('deleteModal').classList.contains('hidden')) {
      closeDeleteConfirm();
    } else if (!document.getElementById('detailModal').classList.contains('hidden')) {
      closeDetailModal();
    }
  }

  if (e.key === 'Enter' && !adminState.authenticated) {
    var loginScreen = document.getElementById('loginScreen');
    if (!loginScreen.classList.contains('hidden') && document.activeElement === document.getElementById('loginPassword')) {
      handleLogin(e);
    }
  }
});

/* ------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', function() {
  // Ensure login screen visible, admin app hidden
  var loginScreen = document.getElementById('loginScreen');
  var adminApp = document.getElementById('adminApp');
  if (loginScreen) loginScreen.classList.remove('hidden');
  if (adminApp) adminApp.classList.add('hidden');

  var loginPwd = document.getElementById('loginPassword');
  if (loginPwd) loginPwd.focus();
});
