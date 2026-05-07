// ─────────────────────────────────────────────────────────────
// get-director.js
// ─────────────────────────────────────────────────────────────
// Fetches a single team member's data from the Team Roster Sheet.
// Called by the portal frontend when a team member visits their
// unique URL.
//
// Example call from frontend:
//   /.netlify/functions/get-director?slug=randy-jo-sly-lion-king
//
// Returns JSON with all columns from the matched row, keyed by
// column header name.
// ─────────────────────────────────────────────────────────────

const { google } = require('googleapis');

// The Team Roster Google Sheet ID
// (The bot has access via the Encore Portal folder it lives in)
const SHEET_ID = '1zWj4EJGDrnylWFraI0gVceVTUw8n_Fl_TuGBpLrE3xI';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const slug = event.queryStringParameters && event.queryStringParameters.slug;
    if (!slug) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing slug parameter' }),
      };
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Read all columns A:Z so we don't miss anything as the sheet grows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:Z',
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No team members found in the roster' }),
      };
    }

    const columnHeaders = rows[0];
    const slugIndex = columnHeaders.indexOf('Portal URL Slug');
    if (slugIndex === -1) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Sheet is missing the "Portal URL Slug" column',
          foundColumns: columnHeaders,
        }),
      };
    }

    const memberRow = rows.find(
      (row, idx) => idx > 0 && row[slugIndex] === slug
    );

    if (!memberRow) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Team member not found', slug }),
      };
    }

    const member = {};
    columnHeaders.forEach((header, idx) => {
      member[header] = memberRow[idx] || '';
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(member),
    };
  } catch (error) {
    console.error('get-director error:', error);
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
