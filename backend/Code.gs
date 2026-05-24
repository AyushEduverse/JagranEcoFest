const MASTER_SHEET_NAME = 'JagranEcoFest';

const SHEET_NAMES = {
  'poster': 'Poster & Slogan Making',
  'quiz': 'Quiz Competition',
  'both': 'Both Competitions'
};

// --- Admin Panel ---
const DEFAULT_ADMIN_PASSWORD = 'JagranEcoFest';  // Kanika Mam can change this via Settings UI

/**
 * Get the effective admin password — first checks ScriptProperties
 * (which is updated when admin changes password via Settings UI),
 * then falls back to the default constant.
 */
function getAdminPassword() {
  var stored = PropertiesService.getScriptProperties()
    .getProperty('ADMIN_PASSWORD');
  return stored || DEFAULT_ADMIN_PASSWORD;
}

function verifyAdmin(password) {
  return password === getAdminPassword();
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Route admin POST requests
    if (data.mode === 'admin') {
      return handleAdminPost(e);
    }

    const sheetName = SHEET_NAMES[data.competition] || 'Other Registrations';
    
    // Map competition key to friendly full name for the sheet representation
    const friendlyCompName = SHEET_NAMES[data.competition] || data.competition || '-';
    
    const teamName = data.teamName ? data.teamName.trim() : '-';
    const m2name   = data.m2name ? data.m2name.trim() : '-';
    const m2batch  = data.m2batch ? data.m2batch.trim() : '-';
    const m3name   = data.m3name ? data.m3name.trim() : '-';
    const m3batch  = data.m3batch ? data.m3batch.trim() : '-';

    // Full 9-column data for Master, Quiz, and Both
    const fullRowData = [
      new Date(),
      data.name      || '',
      data.batch     || '',
      friendlyCompName,
      teamName,
      m2name,
      m2batch,
      m3name,
      m3batch
    ];

    // 5-column data for Poster
    const posterRowData = [
      new Date(),
      data.name      || '',
      data.batch     || '',
      friendlyCompName,
      '-' // Team Name is not applicable for Poster
    ];

    // 1. Save to the Master Sheet
    const masterSheet = getOrCreateSheet(MASTER_SHEET_NAME);
    // Save Captain's row
    masterSheet.appendRow(fullRowData);

    // Save Member 2 as a separate row if present
    if (data.m2name && data.m2name.trim()) {
      const m2Row = [
        new Date(),
        data.m2name.trim(),
        data.m2batch ? data.m2batch.trim() : '',
        friendlyCompName,
        teamName,
        '-', '-', '-', '-' // Member 2 doesn't have their own members
      ];
      masterSheet.appendRow(m2Row);
    }

    // Save Member 3 as a separate row if present
    if (data.m3name && data.m3name.trim()) {
      const m3Row = [
        new Date(),
        data.m3name.trim(),
        data.m3batch ? data.m3batch.trim() : '',
        friendlyCompName,
        teamName,
        '-', '-', '-', '-' // Member 3 doesn't have their own members
      ];
      masterSheet.appendRow(m3Row);
    }

    // 2. Save to the Event-Specific Sheet (keeps team structure as single row)
    const eventSheet = getOrCreateSheet(sheetName);
    if (sheetName === 'Poster & Slogan Making') {
      eventSheet.appendRow(posterRowData);
    } else {
      eventSheet.appendRow(fullRowData);
    }

    // Auto-fit column widths for both sheets to prevent text clipping
    autoFitColumns(masterSheet);
    autoFitColumns(eventSheet);
    
    return jsonResponse({ status: 'success' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doGet(e) {
  try {
    // Route admin GET requests
    if (e.parameter.mode === 'admin') {
      return handleAdminGet(e);
    }

    const name  = (e.parameter.name  || '').toLowerCase().trim();
    const batch = (e.parameter.batch || '').toLowerCase().trim();

    // Since everyone is logged in the Master Sheet, we only need to search here!
    const masterSheet = getOrCreateSheet(MASTER_SHEET_NAME);
    const rows = masterSheet.getDataRange().getValues();

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row    = rows[i];
      const rName  = String(row[1] || '').toLowerCase().trim();
      const rBatch = String(row[2] || '').toLowerCase().trim();

      // Priority 1 — Check if main registrant
      if (rName === name && rBatch === batch) {
        return jsonResponse({
          status: 'already_registered',
          data: {
            name:        row[1],
            batch:       row[2],
            competition: row[3],
            teamName:    row[4],
            timestamp:   row[0]
          }
        });
      }

      // Priority 2 — Check if added as team member (cols F-I, indices 5-8)
      const m2name  = String(row[5] || '').toLowerCase().trim();
      const m2batch = String(row[6] || '').toLowerCase().trim();
      const m3name  = String(row[7] || '').toLowerCase().trim();
      const m3batch = String(row[8] || '').toLowerCase().trim();

      if ((m2name === name && m2batch === batch) ||
          (m3name === name && m3batch === batch)) {
        const isMember2 = (m2name === name && m2batch === batch);
        return jsonResponse({
          status: 'added_as_member',
          data: {
            memberName:   isMember2 ? row[5] : row[7],
            memberBatch:  isMember2 ? row[6] : row[8],
            teamName:     row[4],
            captainName:  row[1],
            captainBatch: row[2],
            competition:  row[3]
          }
        });
      }
    }

    return jsonResponse({ status: 'new_user' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function getOrCreateSheet(sheetName) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);

      let headers = [];

      if (sheetName === 'JagranEcoFest') {
        headers = [
          'Timestamp',
          'Name',
          'Batch',
          'Competition',
          'Team Name',
          'Member 2 Name',
          'Member 2 Batch',
          'Member 3 Name',
          'Member 3 Batch'
        ];
      }
      else if (sheetName === 'Poster & Slogan Making') {
        headers = [
          'Timestamp',
          'Name',
          'Batch',
          'Competition',
          'Team Name'
        ];
      }
      else if (sheetName === 'Quiz Competition') {
        headers = [
          'Timestamp',
          'Name',
          'Batch',
          'Competition',
          'Team Name',
          'Member 2 Name',
          'Member 2 Batch',
          'Member 3 Name',
          'Member 3 Batch'
        ];
      }
      else if (sheetName === 'Both Competitions') {
        headers = [
          'Timestamp',
          'Name',
          'Batch',
          'Competition',
          'Team Name',
          'Member 2 Name',
          'Member 2 Batch',
          'Member 3 Name',
          'Member 3 Batch'
        ];
      } else {
        // Fallback for any other sheets
        headers = ['Timestamp', 'Name', 'Batch', 'Competition'];
      }

      sheet.appendRow(headers);

      // =========================
      // HEADER STYLING
      // =========================
      const headerRange = sheet.getRange(1, 1, 1, headers.length);

      headerRange
        .setFontWeight('bold')
        .setFontSize(12)
        .setFontColor('#FFFFFF')
        .setBackground('#1B5E20')
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle');

      // =========================
      // FREEZE HEADER
      // =========================
      sheet.setFrozenRows(1);

      // =========================
      // COLUMN WIDTHS & AUTO FIT
      // =========================
      autoFitColumns(sheet);

      // =========================
      // BORDERS
      // =========================
      sheet.getRange(1, 1, 1000, headers.length).setBorder(
        true, true, true, true, true, true,
        '#D0D0D0',
        SpreadsheetApp.BorderStyle.SOLID
      );

      // =========================
      // ALTERNATE ROW COLORS
      // =========================
      const dataRange = sheet.getRange(2, 1, 1000, headers.length);
      const rules = [];

      rules.push(
        SpreadsheetApp
          .newConditionalFormatRule()
          .whenFormulaSatisfied('=ISEVEN(ROW())')
          .setBackground('#E8F5E9')
          .setRanges([dataRange])
          .build()
      );

      sheet.setConditionalFormatRules(rules);

      // =========================
      // TAB COLORS
      // =========================
      if (sheetName === 'JagranEcoFest') {
        sheet.setTabColor('#1565C0');
      }
      else if (sheetName === 'Poster & Slogan Making') {
        sheet.setTabColor('#43A047');
      }
      else if (sheetName === 'Quiz Competition') {
        sheet.setTabColor('#FB8C00');
      }
      else if (sheetName === 'Both Competitions') {
        sheet.setTabColor('#8E24AA');
      }
    }

    return sheet;
  } catch (e) {
    console.error("Error in getOrCreateSheet: " + e.message);
    throw e;
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Auto-fit column widths with safety minimum limits to prevent narrow columns
function autoFitColumns(sheet) {
  try {
    const lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) return;
    
    // 1. First, tell Google Sheets to automatically resize based on current data
    sheet.autoResizeColumns(1, lastColumn);
    
    // 2. Define standard minimum widths (in pixels) for fields so they look uniform
    // key is column index (1-indexed)
    const minWidths = {
      1: 180, // Timestamp
      2: 200, // Name
      3: 150, // Batch
      4: 200, // Competition
      5: 160, // Team Name
      6: 200, // Member 2 Name
      7: 150, // Member 2 Batch
      8: 200, // Member 3 Name
      9: 150  // Member 3 Batch
    };
    
    // 3. Apply minimum limit: if autoResize shrunk it too small, expand it to minWidth
    for (let i = 1; i <= lastColumn; i++) {
      const currentWidth = sheet.getColumnWidth(i);
      const minW = minWidths[i] || 150;
      if (currentWidth < minW) {
        sheet.setColumnWidth(i, minW);
      }
    }
  } catch (e) {
    console.error("Error in autoFitColumns: " + e.message);
  }
}

// ======================================================================
// ADMIN PANEL — GET HANDLER (routes all admin GET requests)
// ======================================================================

function handleAdminGet(e) {
  var action = e.parameter.action || '';
  var password = e.parameter.password || '';

  // ── Password Reset: checks against DEFAULT password (not stored) ──
  // This allows resetting even if the stored password is unknown.
  if (action === 'reset-password') {
    if (password === DEFAULT_ADMIN_PASSWORD) {
      PropertiesService.getScriptProperties().deleteProperty('ADMIN_PASSWORD');
      return jsonResponse({ status: 'success', message: 'Password reset to default' });
    }
    return jsonResponse({ status: 'error', message: 'Invalid default password' });
  }

  if (!verifyAdmin(password)) {
    return jsonResponse({ status: 'error', message: 'Invalid admin password' });
  }

  if (action === 'auth') {
    return jsonResponse({ status: 'authenticated', message: 'Access granted' });
  }

  if (action === 'stats') {
    return jsonResponse(getAdminStats());
  }

  if (action === 'registrations') {
    return jsonResponse(getFilteredRegistrations(e));
  }

  if (action === 'detail') {
    return jsonResponse(getRegistrationDetail(e));
  }

  if (action === 'export') {
    return handleExport(e);
  }

  if (action === 'settings') {
    return jsonResponse(getEventSettings());
  }

  // ── NEW: update-settings via GET (flat query params instead of POST body) ──
  // Frontend changed adminPost from POST to GET to bypass CORS issues.
  // Settings fields arrive as flat e.parameter keys.
  if (action === 'update-settings') {
    return jsonResponse(saveEventSettings(e.parameter));
  }

  // ── NEW: delete via GET (flat query params instead of POST body) ──
  if (action === 'delete') {
    return jsonResponse(deleteRegistrationRow(e.parameter));
  }

  return jsonResponse({ status: 'error', message: 'Unknown admin action: ' + action });
}

// ======================================================================
// ADMIN PANEL — POST HANDLER (routes all admin POST requests)
// ======================================================================

function handleAdminPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action || '';
  var password = data.password || '';

  if (!verifyAdmin(password)) {
    return jsonResponse({ status: 'error', message: 'Invalid admin password' });
  }

  if (action === 'delete') {
    return deleteRegistrationRow(data);
  }

  if (action === 'update-settings') {
    return saveEventSettings(data);
  }

  return jsonResponse({ status: 'error', message: 'Unknown admin action: ' + action });
}

// ======================================================================
// DASHBOARD STATS
// ======================================================================

function getAdminStats() {
  var sheet = getOrCreateSheet(MASTER_SHEET_NAME);
  var rows = sheet.getDataRange().getValues();

  if (rows.length < 2) {
    return {
      status: 'success',
      data: {
        totalRegistrations: 0,
        posterCount: 0,
        quizCount: 0,
        bothCount: 0,
        teamCount: 0,
        todayCount: 0,
        weeklyCount: 0,
        registrationsByDate: []
      }
    };
  }

  var dataRows = rows.slice(1);
  var posterCount = 0, quizCount = 0, bothCount = 0;
  var teamSet = {};
  var todayCount = 0, weeklyCount = 0;
  var dateCounts = {};

  var now = new Date();
  var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  for (var i = 0; i < dataRows.length; i++) {
    var row = dataRows[i];
    var competition = String(row[3] || '').toLowerCase();
    var teamName = String(row[4] || '').trim();
    var timestamp = row[0];

    if (competition.indexOf('poster') !== -1) posterCount++;
    else if (competition.indexOf('quiz') !== -1) quizCount++;
    else if (competition.indexOf('both') !== -1) bothCount++;

    if (teamName && teamName !== '-' && teamName !== '') {
      teamSet[teamName] = true;
    }

    if (timestamp instanceof Date) {
      if (timestamp >= todayStart) todayCount++;
      if (timestamp >= weekStart) weeklyCount++;

      var dateKey = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (dateCounts[dateKey]) {
        dateCounts[dateKey]++;
      } else {
        dateCounts[dateKey] = 1;
      }
    }
  }

  var sortedDates = Object.keys(dateCounts).sort();
  var registrationsByDate = sortedDates.slice(-14).map(function(date) {
    return { date: date, count: dateCounts[date] };
  });

  return {
    status: 'success',
    data: {
      totalRegistrations: dataRows.length,
      posterCount: posterCount,
      quizCount: quizCount,
      bothCount: bothCount,
      teamCount: Object.keys(teamSet).length,
      todayCount: todayCount,
      weeklyCount: weeklyCount,
      registrationsByDate: registrationsByDate
    }
  };
}

// ======================================================================
// FILTERED REGISTRATIONS (search, filter, sort, paginate)
// ======================================================================

function getFilteredRegistrations(e) {
  var sheet = getOrCreateSheet(MASTER_SHEET_NAME);
  var rows = sheet.getDataRange().getValues();

  if (rows.length < 2) {
    return { status: 'success', data: { rows: [], total: 0, page: 1, perPage: 50, totalPages: 0 } };
  }

  var search = (e.parameter.search || '').toLowerCase().trim();
  var competition = (e.parameter.competition || 'all').toLowerCase().trim();
  var batchFilter = (e.parameter.batch || 'all').toLowerCase().trim();
  var page = parseInt(e.parameter.page) || 1;
  var perPage = parseInt(e.parameter.perPage) || 50;
  var sortColumn = e.parameter.sortColumn || 'timestamp';
  var sortDirection = e.parameter.sortDirection || 'desc';

  // Parse data rows, skipping header (row 0)
  var dataRows = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    dataRows.push({
      sheetRowIndex: i + 1,  // 1-indexed sheet row number
      timestamp: r[0],
      name: String(r[1] || ''),
      batch: String(r[2] || ''),
      competition: String(r[3] || ''),
      teamName: String(r[4] || ''),
      m2name: String(r[5] || ''),
      m2batch: String(r[6] || ''),
      m3name: String(r[7] || ''),
      m3batch: String(r[8] || '')
    });
  }

  // Apply search filter (name + batch)
  if (search) {
    dataRows = dataRows.filter(function(r) {
      return r.name.toLowerCase().indexOf(search) !== -1 ||
             r.batch.toLowerCase().indexOf(search) !== -1;
    });
  }

  // Apply competition filter
  if (competition !== 'all') {
    dataRows = dataRows.filter(function(r) {
      return r.competition.toLowerCase().indexOf(competition) !== -1;
    });
  }

  // Apply batch filter
  if (batchFilter !== 'all') {
    dataRows = dataRows.filter(function(r) {
      return r.batch.toLowerCase().indexOf(batchFilter) !== -1;
    });
  }

  // Apply sorting
  var sortMultiplier = sortDirection === 'asc' ? 1 : -1;
  dataRows.sort(function(a, b) {
    var valA, valB;
    switch (sortColumn) {
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortMultiplier;
      case 'batch':
        valA = a.batch.toLowerCase();
        valB = b.batch.toLowerCase();
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortMultiplier;
      case 'competition':
        valA = a.competition.toLowerCase();
        valB = b.competition.toLowerCase();
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortMultiplier;
      case 'teamName':
        valA = a.teamName.toLowerCase();
        valB = b.teamName.toLowerCase();
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortMultiplier;
      case 'timestamp':
      default:
        valA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
        valB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
        return (valA - valB) * sortMultiplier;
    }
  });

  var total = dataRows.length;
  var totalPages = Math.ceil(total / perPage) || 1;
  var startIdx = (page - 1) * perPage;
  var pagedRows = dataRows.slice(startIdx, startIdx + perPage);

  return {
    status: 'success',
    data: {
      rows: pagedRows,
      total: total,
      page: page,
      perPage: perPage,
      totalPages: totalPages
    }
  };
}

// ======================================================================
// REGISTRATION DETAIL
// ======================================================================

function getRegistrationDetail(e) {
  var rowIndex = parseInt(e.parameter.rowIndex);
  var sheet = getOrCreateSheet(MASTER_SHEET_NAME);
  var rows = sheet.getDataRange().getValues();

  if (isNaN(rowIndex) || rowIndex < 1 || rowIndex > rows.length) {
    return { status: 'error', message: 'Invalid row index' };
  }

  var row = rows[rowIndex - 1];

  return {
    status: 'success',
    data: {
      sheetRowIndex: rowIndex,
      timestamp: row[0],
      name: row[1],
      batch: row[2],
      competition: row[3],
      teamName: row[4],
      m2name: row[5],
      m2batch: row[6],
      m3name: row[7],
      m3batch: row[8],
      hasTeam: String(row[4] || '') !== '-' && String(row[4] || '') !== '',
      memberCount: [row[5], row[7]].filter(function(m) { return m && m !== '-' && m.trim() !== ''; }).length
    }
  };
}

// ======================================================================
// EXPORT CSV
// ======================================================================

function handleExport(e) {
  var sheet = getOrCreateSheet(MASTER_SHEET_NAME);
  var rows = sheet.getDataRange().getValues();

  // Apply competition filter if specified
  var competitionFilter = (e.parameter.competition || 'all').toLowerCase().trim();

  var csv = 'Timestamp,Name,Batch,Competition,Team Name,Member 2 Name,Member 2 Batch,Member 3 Name,Member 3 Batch\n';

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var comp = String(row[3] || '').toLowerCase().trim();

    // Skip if competition filter is active and doesn't match
    if (competitionFilter !== 'all' && comp.indexOf(competitionFilter) === -1) {
      continue;
    }

    var csvCells = [];
    for (var j = 0; j < row.length; j++) {
      var val = String(row[j] || '');
      // Escape CSV: wrap in quotes if contains comma, double-quote, or newline
      if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1 || val.indexOf('\n') !== -1) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      csvCells.push(val);
    }
    csv += csvCells.join(',') + '\n';
  }

  return ContentService
    .createTextOutput(csv)
    .setMimeType(ContentService.MimeType.CSV)
    .downloadAsFile('JagranEcoFest-Registrations.csv');
}

// ======================================================================
// DELETE REGISTRATION (by composite key: name + batch + timestamp)
// ======================================================================

function deleteRegistrationRow(data) {
  var rowIndex = parseInt(data.rowIndex);
  var sheet = getOrCreateSheet(MASTER_SHEET_NAME);
  var rows = sheet.getDataRange().getValues();

  // Use composite key (name + batch + timestamp) as the primary identifier
  // to avoid issues with row indices shifting after deletions
  var targetName = (data.name || '').toLowerCase().trim();
  var targetBatch = (data.batch || '').toLowerCase().trim();
  var targetTimestamp = (data.timestamp || '').trim();

  // Try composite key match first
  if (targetName && targetBatch) {
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var rName = String(r[1] || '').toLowerCase().trim();
      var rBatch = String(r[2] || '').toLowerCase().trim();
      var rTimestamp = String(r[0] instanceof Date ? r[0].toISOString() : String(r[0] || '')).trim();

      // Name + batch must match; timestamp can be a partial match (start of string)
      if (rName === targetName && rBatch === targetBatch) {
        var tsMatch = !targetTimestamp || rTimestamp.indexOf(targetTimestamp) !== -1 || targetTimestamp.indexOf(rTimestamp) !== -1;
        if (tsMatch) {
          var deletedName = String(r[1] || '');
          sheet.deleteRow(i + 1);
          return jsonResponse({
            status: 'success',
            message: 'Deleted registration for ' + deletedName
          });
        }
      }
    }
  }

  // Fallback: delete by row index if composite key didn't match
  if (!isNaN(rowIndex) && rowIndex >= 1 && rowIndex < rows.length) {
    var deletedName = String(rows[rowIndex - 1][1] || '');
    sheet.deleteRow(rowIndex);
    return jsonResponse({
      status: 'success',
      message: 'Deleted registration for ' + deletedName
    });
  }

  return jsonResponse({ status: 'error', message: 'Registration not found' });
}

// ======================================================================
// EVENT SETTINGS (stored in a separate 'Settings' sheet tab)
// ======================================================================

function getEventSettings() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Settings');

    if (!sheet) {
      return {
        status: 'success',
        data: {
          eventName: 'World Environment Day 2026',
          eventDate: '5th June 2026',
          deadline: '30 May 2026',
          tagline: 'Celebrate. Create. Conserve.',
          collegeName: 'Jagran College of Arts, Science and Commerce'
        }
      };
    }

    var rows = sheet.getDataRange().getValues();
    var settings = { eventName: '', eventDate: '', deadline: '', tagline: '', collegeName: '' };

    for (var i = 0; i < rows.length; i++) {
      var key = String(rows[i][0] || '').toLowerCase().replace(/\s+/g, '');
      var val = String(rows[i][1] || '');

      if (key === 'eventname') settings.eventName = val;
      else if (key === 'eventdate') settings.eventDate = val;
      else if (key === 'deadline') settings.deadline = val;
      else if (key === 'tagline') settings.tagline = val;
      else if (key === 'collegename') settings.collegeName = val;
    }

    return { status: 'success', data: settings };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * Save event settings + optionally update admin password.
 *
 * Called via GET (flat params) or POST: { action: 'update-settings', settings: { ... }, adminPassword: '...' }
 *
 * Supports both:
 *   - POST format: data.settings = { eventName, eventDate, ... }
 *   - GET format:  flat params on data = { eventName, eventDate, ... }
 * (GET is used after frontend switched from POST to bypass CORS)
 */
function saveEventSettings(data) {
  try {
    // Support both:
    //   POST format: data.settings = { eventName, eventDate, ... }
    //   GET format:  flat params on data = { eventName, eventDate, ... }
    // (GET is used after frontend switched from POST to bypass CORS)
    var settings = data.settings || data;

    if (!settings || typeof settings !== 'object') {
      return { status: 'error', message: 'Invalid settings data' };
    }

    // ── Save event info to 'Settings' sheet tab ──
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Settings');

    if (!sheet) {
      sheet = ss.insertSheet('Settings');
      sheet.appendRow(['Setting', 'Value']);
      sheet.getRange(1, 1, 1, 2)
        .setFontWeight('bold')
        .setBackground('#2D5A27')
        .setFontColor('#FFFFFF');
    }

    sheet.deleteRows(2, sheet.getLastRow() - 1 || 1);

    var configMap = {
      eventName: 'Event Name',
      eventDate: 'Event Date',
      deadline: 'Deadline',
      tagline: 'Tagline',
      collegeName: 'College Name'
    };

    for (var key in configMap) {
      if (settings[key] !== undefined) {
        sheet.appendRow([configMap[key], String(settings[key])]);
      }
    }

    // ── Save admin password to ScriptProperties if provided ──
    if (settings.adminPassword) {
      PropertiesService.getScriptProperties()
        .setProperty('ADMIN_PASSWORD', settings.adminPassword);
    }

    return { status: 'success', message: 'Settings saved successfully' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
