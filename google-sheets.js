const { google } = require("googleapis");

const rawSheetId = (process.env.GOOGLE_SHEET_ID || "").trim();
const sheetTab = process.env.GOOGLE_SHEET_TAB || "Quote Submissions";
const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "";

let sheetsClient = null;

const SHEET_HEADERS = [
  "Submission Date",
  "Customer Name",
  "Company",
  "Phone",
  "Email",
  "Service Requested",
  "Origin",
  "Destination",
  "Cargo / Package Details",
  "Cargo Weight",
  "Cargo Volume",
  "Shipping Date",
  "Preferred Contact",
  "Message",
  "Status",
  "Admin Notes"
];

function extractSheetId(value) {
  if (!value) return "";
  const match = value.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  return value.trim();
}

const sheetId = extractSheetId(rawSheetId);

function parseServiceAccountCredentials() {
  const raw = (serviceAccountJson || "").trim();
  if (!raw || raw.includes("your-google") || raw === "{}") return null;

  try {
    const decoded = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const credentials = JSON.parse(decoded);

    if (!credentials || typeof credentials !== "object") {
      return null;
    }

    if (!credentials.client_email || !credentials.private_key) {
      return null;
    }

    return credentials;
  } catch (error) {
    return null;
  }
}

function isConfigured() {
  return Boolean(sheetId && sheetId !== "your-google-sheet-id" && parseServiceAccountCredentials());
}

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const credentials = parseServiceAccountCredentials();
  if (!sheetId || !credentials) {
    throw new Error("Google Sheets is not configured. Set a valid GOOGLE_SHEET_ID and a service account JSON containing client_email and private_key.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

async function appendQuoteSubmission({
  createdAt,
  fullName,
  company,
  phone,
  email,
  service,
  origin,
  destination,
  cargoType,
  cargoWeight,
  cargoVolume,
  shippingDate,
  preferredContact,
  message,
  status,
  adminNotes
}) {
  if (!isConfigured()) return;

  try {
    const client = getSheetsClient();

    await client.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheetTab}!A:P`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            createdAt || new Date().toISOString(),
            fullName || "",
            company || "",
            phone || "",
            email || "",
            service || "",
            origin || "",
            destination || "",
            cargoType || "",
            cargoWeight || "",
            cargoVolume || "",
            shippingDate || "",
            preferredContact || "Email / Phone",
            message || "",
            status || "New",
            adminNotes || ""
          ]
        ]
      }
    });
  } catch (error) {
    console.error("Google Sheets append error:", error.message);
  }
}

async function testConnection() {
  if (!isConfigured()) {
    throw new Error("Google Sheets is not configured.");
  }

  const client = getSheetsClient();
  await client.spreadsheets.get({
    spreadsheetId: sheetId
  });
}


async function getSheetInfo() {
  if (!isConfigured()) {
    throw new Error("Google Sheets is not configured. Set a valid GOOGLE_SHEET_ID and a service account JSON containing client_email and private_key.");
  }

  const client = getSheetsClient();
  const response = await client.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: "title"
  });

  return {
    title: response.data.title || sheetId,
    sheetId: sheetId,
    tab: sheetTab
  };
}


async function getHeaders() {
  if (!isConfigured()) {
    throw new Error("Google Sheets is not configured.");
  }

  const client = getSheetsClient();
  const response = await client.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetTab}!A1:P1`
  });

  const rows = response.data.values || [];
  return rows[0] || SHEET_HEADERS;
}


async function getSubmissions() {
  if (!isConfigured()) {
    throw new Error("Google Sheets is not configured. Set a valid GOOGLE_SHEET_ID and a service account JSON containing client_email and private_key.");
  }

  const client = getSheetsClient();
  const response = await client.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetTab}!A2:P`
  });

  const rows = response.data.values || [];

  return rows.map((row, index) => {
    const submission = {};

    SHEET_HEADERS.forEach((header, col) => {
      submission[header] = row[col] || "";
    });

    submission._rowNumber = index + 2;
    return submission;
  });
}


async function updateSubmission(rowNumber, updates) {
  if (!isConfigured()) {
    throw new Error("Google Sheets is not configured.");
  }

  const client = getSheetsClient();

  if (updates.status !== undefined) {
    await client.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetTab}!O${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[updates.status]]
      }
    });
  }

  if (updates.adminNotes !== undefined) {
    await client.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetTab}!P${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[updates.adminNotes]]
      }
    });
  }
}


module.exports = {
  appendQuoteSubmission,
  testConnection,
  isConfigured,
  getSheetInfo,
  getHeaders,
  getSubmissions,
  updateSubmission,
  extractSheetId,
  SHEET_HEADERS
};
