# Google Sheets quote storage

## Setup

1. Create a Google Sheet and add a tab named `Quote Submissions`.
2. In row 1, add these exact headers from column A through P:

   | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
   |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
   | Submission Date | Customer Name | Company | Phone | Email | Service Requested | Origin | Destination | Cargo / Package Details | Cargo Weight | Cargo Volume | Shipping Date | Preferred Contact | Message | Status | Admin Notes |

3. In [Google Cloud Console](https://console.cloud.google.com/):
   - Create or select a project
   - Enable the **Google Sheets API**
   - Create a **service account** and download the JSON key
4. Share the Google Sheet with the service-account email as an **Editor**
5. Copy the spreadsheet ID from the Sheet URL (`/d/` + ID + `/edit`)

## Environment variables

Add these to your `.env` file for local development, or to Render for production:

```env
GOOGLE_SHEET_ID=your-spreadsheet-id
GOOGLE_SHEET_TAB=Quote Submissions
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"","private_key_id":"","private_key":"","client_email":"","client_id":"","auth_uri":"","token_uri":"","auth_provider_x509_cert_url":"","client_x509_cert_url":""}
```

> **Note for Render:** If Render rejects the JSON formatting, base64-encode the JSON file and use that base64 text as `GOOGLE_SERVICE_ACCOUNT_JSON` instead.

## How it works

- When a quote is submitted via the website, it is saved to the local SQLite database and also appended to Google Sheets.
- If Google Sheets is not configured or the sync fails, the quote still saves to SQLite and the website continues to work normally.
- The admin dashboard reads from SQLite, not Google Sheets.
