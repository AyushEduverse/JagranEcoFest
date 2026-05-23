const MASTER_SHEET_NAME = 'JagranEcoFest';

const SHEET_NAMES = {
  'poster': 'Poster & Slogan Making',
  'quiz': 'Quiz Competition',
  'both': 'Both Competitions'
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
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

