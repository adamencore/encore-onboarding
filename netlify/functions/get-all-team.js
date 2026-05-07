// ─────────────────────────────────────────────────────────────
// get-all-team.js
// ─────────────────────────────────────────────────────────────
// Returns ALL team members from the Team Roster Sheet.
// Used by the internal dashboard page to list everyone.
//
// Example call from frontend:
//   /.netlify/functions/get-all-team
//
// Returns JSON like:
//   { "team": [ {...}, {...}, ... ] }
// ─────────────────────────────────────────────────────────────

const { google } = require('googleapis');

const SHEET_ID = '1zWj4EJGDrnylWFraI0gVceVTUw8n_Fl_TuGBpLrE3xI';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:Z',
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ team: [] }),
      };
    }

    const columnHeaders = rows[0];

    // Convert each row to an object keyed by column header,
    // skipping any empty rows (no name).
    const team = rows
      .slice(1)
      .map((row) => {
        const member = {};
        columnHeaders.forEach((header, idx) => {
          member[header] = row[idx] || '';
        });
        return member;
      })
      .filter((member) => member['Name']);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ team }),
    };
  } catch (error) {
    console.error('get-all-team error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error',
        message: error.message,
      }),
    };
  }
};
