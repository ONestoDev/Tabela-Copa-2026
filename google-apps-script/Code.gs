const SHEET_NAME = 'Storage';
const BACKUP_SHEET_NAME = 'StorageBackups';

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || 'load';
  const key = params.key || 'copa2026-novo';
  const callback = params.callback || '';

  if(action !== 'load') {
    return jsonResponse({ok:false, error:'Unsupported action'}, callback);
  }

  const state = loadState(key);
  return jsonResponse({ok:true, key:key, state:state}, callback);
}

function doPost(e) {
  const payload = parsePayload(e);
  const action = payload.action || 'save';
  const key = payload.key || 'copa2026-novo';

  if(action !== 'save') {
    return jsonResponse({ok:false, error:'Unsupported action'});
  }

  saveState(key, payload.state || {});
  return jsonResponse({ok:true, key:key, updatedAt:new Date().toISOString()});
}

function parsePayload(e) {
  if(!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    return {};
  }
}

function loadState(key) {
  const sheet = getStorageSheet();
  const row = findKeyRow(sheet, key);
  if(row === -1) return null;
  const raw = sheet.getRange(row, 2).getValue();
  if(!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveState(key, state) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getStorageSheet();
    const row = findKeyRow(sheet, key);
    const values = [key, JSON.stringify(state), new Date()];
    if(row === -1) {
      sheet.appendRow(values);
    } else {
      backupState(key, sheet.getRange(row, 2).getValue());
      sheet.getRange(row, 1, 1, values.length).setValues([values]);
    }
  } finally {
    lock.releaseLock();
  }
}

function backupState(key, rawState) {
  if(!rawState) return;
  const backupSheet = getBackupSheet();
  backupSheet.appendRow([key, rawState, new Date()]);
  const maxBackups = 100;
  const extraRows = backupSheet.getLastRow() - 1 - maxBackups;
  if(extraRows > 0) {
    backupSheet.deleteRows(2, extraRows);
  }
}

function getStorageSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if(!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, 3).setValues([['key', 'state', 'updatedAt']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getBackupSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(BACKUP_SHEET_NAME);
  if(!sheet) {
    sheet = spreadsheet.insertSheet(BACKUP_SHEET_NAME);
    sheet.getRange(1, 1, 1, 3).setValues([['key', 'state', 'backedUpAt']]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findKeyRow(sheet, key) {
  const lastRow = sheet.getLastRow();
  if(lastRow < 2) return -1;
  const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for(let index = 0; index < keys.length; index += 1) {
    if(keys[index][0] === key) return index + 2;
  }
  return -1;
}

function jsonResponse(payload, callback) {
  const body = callback
    ? `${callback}(${JSON.stringify(payload)});`
    : JSON.stringify(payload);
  const mimeType = callback
    ? ContentService.MimeType.JAVASCRIPT
    : ContentService.MimeType.JSON;
  return ContentService
    .createTextOutput(body)
    .setMimeType(mimeType);
}
