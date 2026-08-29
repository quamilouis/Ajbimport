# Google Sheets quote storage

1. Create a Google Sheet and add a tab named `Quote Submissions`.
2. Put these headers in row 1, from column A through P:
   `Submission Date`, `Customer Name`, `Company`, `Phone`, `Email`, `Service Requested`, `Origin`, `Destination`, `Cargo / Package Details`, `Cargo Weight`, `Cargo Volume`, `Shipping Date`, `Preferred Contact`, `Message`, `Status`, `Admin Notes`.
3. In Google Cloud Console, create or select a project.
4. Enable the Google Sheets API.
5. Create a service account and create a JSON key.
6. Share the Google Sheet with the service-account email as an Editor.
7. Copy the spreadsheet ID from the Sheet URL. It is the value between `/d/` and `/edit`.
8. In Render, add these environment variables:

   - `GOOGLE_SHEET_ID`: the spreadsheet ID
   - `GOOGLE_SERVICE_ACCOUNT_JSON`: the complete contents of the service-account JSON key on one line
   - `GOOGLE_SHEET_TAB`: `Quote Submissions` unless you used a different tab name

   Render must contain the complete JSON value, including `private_key`. If Render rejects the JSON formatting, base64-encode the JSON file and use that base64 text as `GOOGLE_SERVICE_ACCOUNT_JSON` instead.

When both variables are set, quote submissions are appended to Google Sheets. Without them, local development continues to use the Excel fallback.
