// ─────────────────────────────────────────────────────────────
// get-director.js
// ─────────────────────────────────────────────────────────────
// Fetches a single director's data from the Director Roster Sheet.
// Called by the portal frontend when a director visits their unique URL.
//
// Example call from frontend:
//   /.netlify/functions/get-director?slug=randy-jo-sly-lion-king
//
// Returns JSON like:
//   {
//     "Name": "Randy Jo Sly",
//     "Show": "The Lion King",
//     "Portal URL Slug": "randy-jo-sly-lion-king",
//     "Headshot URL": "",
//     "Bio": "",
//     "Director's Vision": "",
//     "Training Completed": "",
//     "Background Check Completed": "",
//     "Date Created": "2026-05-06"
//   }
// ─────────────────────────────────────────────────────────────

const { google } = require('googleapis');

// The Director Roster Google Sheet ID
// (The bot has access via the Encore Portal folder it lives in)
const SHEET_ID = '1zWj4EJGDrnylWFraI0gVceVTUw8n_Fl_TuGBpLrE3xI';

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // 1. Get the slug from the URL query parameter
    const slug = event.queryStringParameters && event.queryStringParameters.slug;
    if (!slug) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing slug parameter' }),
      };
    }

    // 2. Authenticate as the bot using the service account key from env vars
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 3. Read all rows from the Director Roster (columns A through I)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'A:I',
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No directors found in the roster' }),
      };
    }

    // 4. First row is column headers; find the "Portal URL Slug" column index
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

    // 5. Find the row whose slug matches the request
    const directorRow = rows.find(
      (row, idx) => idx > 0 && row[slugIndex] === slug
    );

    if (!directorRow) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Director not found', slug }),
      };
    }

    // 6. Build a clean object keyed by column header
    const director = {};
    columnHeaders.forEach((header, idx) => {
      director[header] = directorRow[idx] || '';
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(director),
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
