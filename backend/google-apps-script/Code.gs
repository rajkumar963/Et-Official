/** Paste this file into Extensions > Apps Script in the contact spreadsheet. */
const CONTACT_SPREADSHEET_ID = '16U9lTOd0e5iEWExcQ3qIJQSjmQakE-OQ-oYjURhpXpU';
const CONTACT_SHEET_GID = 0;
const CONTACT_HEADERS = ['Timestamp (UTC)', 'Name', 'Email', 'Topic', 'Message'];

/** Run once from the editor, authorize access, then deploy as a web app. */
function setupContactSheet() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('CONTACT_SHARED_SECRET')) {
    properties.setProperty('CONTACT_SHARED_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    initializeContactHeaders_(getContactSheet_());
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  console.log(
    'Ready. Copy CONTACT_SHARED_SECRET from Project Settings > Script properties into the backend GOOGLE_SHEETS_WEB_APP_SECRET environment variable.',
  );
}

/** Read-only deployment check. Never returns credentials or contact messages. */
function doGet() {
  return contactJson_({
    ok: true,
    service: 'ET Official contact',
    ready: Boolean(PropertiesService.getScriptProperties().getProperty('CONTACT_SHARED_SECRET')),
  });
}

function doPost(event) {
  let lock;
  let acquired = false;
  try {
    const raw = event && event.postData && event.postData.contents;
    if (typeof raw !== 'string' || raw.length > 20000)
      return contactJson_({ ok: false, error: 'Invalid request.' });
    const input = JSON.parse(raw);
    const secret = PropertiesService.getScriptProperties().getProperty('CONTACT_SHARED_SECRET');
    if (!secret || !input || typeof input !== 'object' || input.secret !== secret)
      return contactJson_({ ok: false, error: 'Unauthorized.' });
    const message = validateContactMessage_(input);
    if (!message) return contactJson_({ ok: false, error: 'Invalid contact details.' });

    lock = LockService.getScriptLock();
    acquired = lock.tryLock(10000);
    if (!acquired) return contactJson_({ ok: false, error: 'Please try again later.' });
    const sheet = getContactSheet_();
    initializeContactHeaders_(sheet);
    const row = sheet.getLastRow() + 1;
    if (row > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 1);
    const values = [
      new Date().toISOString(),
      message.name,
      message.email,
      message.topic,
      message.message,
    ];
    sheet
      .getRange(row, 1, 1, CONTACT_HEADERS.length)
      .setNumberFormat('@')
      .setValues([values.map(contactPlainText_)]);
    SpreadsheetApp.flush();
    return contactJson_({ ok: true, spreadsheetId: CONTACT_SPREADSHEET_ID, row: row });
  } catch (error) {
    return contactJson_({ ok: false, error: 'Message could not be saved.' });
  } finally {
    if (acquired) lock.releaseLock();
  }
}

function getContactSheet_() {
  const spreadsheet = SpreadsheetApp.openById(CONTACT_SPREADSHEET_ID);
  const sheet = spreadsheet.getSheets().find(function (item) {
    return item.getSheetId() === CONTACT_SHEET_GID;
  });
  if (!sheet) throw new Error('Contact worksheet was not found.');
  return sheet;
}

function initializeContactHeaders_(sheet) {
  if (sheet.getLastRow() !== 0) return;
  sheet
    .getRange(1, 1, 1, CONTACT_HEADERS.length)
    .setValues([CONTACT_HEADERS])
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function validateContactMessage_(input) {
  const result = {};
  const limits = { name: [2, 100], email: [3, 254], topic: [1, 40], message: [10, 5000] };
  for (const key in limits) {
    if (typeof input[key] !== 'string') return null;
    const value = input[key].trim();
    if (value.length < limits[key][0] || value.length > limits[key][1]) return null;
    result[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) return null;
  if (['Journal support', 'Courses', 'E-books', 'Something else'].indexOf(result.topic) < 0)
    return null;
  if (input.website && input.website !== '') return null;
  return result;
}

function contactPlainText_(value) {
  return /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
}

function contactJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
