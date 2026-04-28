import { google } from 'googleapis'

const sheets = google.sheets('v4')

// 初始化Google Sheets API
function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}')
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return sheets
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || ''

// Groups表
export async function getGroups() {
  const response = await getSheets().spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'groups!A:H',
  })
  return response.data.values || []
}

export async function addGroup(group: {
  name: string
  url: string
  memberCount: number
  lastActivity: string
  description: string
  isAgriculture: boolean
  hasTrading: boolean
}) {
  await getSheets().spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'groups!A:H',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        new Date().toISOString(),
        group.name,
        group.url,
        group.memberCount,
        group.lastActivity,
        group.description,
        group.isAgriculture ? '是' : '否',
        group.hasTrading ? '是' : '否',
      ]],
    },
  })
}

export async function updateGroupStatus(row: number, status: string) {
  await getSheets().spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `groups!I${row}:I${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  })
}

// Admins表
export async function getAdmins() {
  const response = await getSheets().spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'admins!A:G',
  })
  return response.data.values || []
}

export async function addAdmin(admin: {
  name: string
  profileUrl: string
  role: string
  groupName: string
}) {
  await getSheets().spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'admins!A:G',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        new Date().toISOString(),
        admin.name,
        admin.profileUrl,
        admin.role,
        admin.groupName,
        '否',
      ]],
    },
  })
}

// Outreach Log表
export async function getOutreachLogs() {
  const response = await getSheets().spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'outreach!A:F',
  })
  return response.data.values || []
}

export async function addOutreachLog(log: {
  adminName: string
  groupName: string
  message: string
  variationType: string
}) {
  await getSheets().spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'outreach!A:F',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        new Date().toISOString(),
        log.adminName,
        log.groupName,
        log.variationType,
        log.message,
        'pending',
      ]],
    },
  })
}

export async function updateOutreachStatus(row: number, status: string) {
  await getSheets().spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `outreach!F${row}:F${row}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  })
}
