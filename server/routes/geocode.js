const express = require('express');
const axios = require('axios');
const router = express.Router();

// Nominatim's public endpoint is shared, rate-limited (1 req/sec) infra —
// under load (e.g. several donors/NGOs onboarding at once, all sharing this
// backend's one outbound IP) a single request can time out or get briefly
// throttled even though the exact same query succeeds a moment later. One
// short retry recovers almost all of these without hammering Nominatim or
// blowing past the app's client-side request timeout (10s): two attempts at
// 3.5s each plus a short backoff comfortably fits inside that budget.
async function fetchFromNominatim(q, timeoutMs) {
  return axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q,
      format: 'json',
      limit: 1,
    },
    headers: {
      'User-Agent': 'FoodLoop-Rescue-App-Client-v1',
    },
    timeout: timeoutMs,
  });
}

// GET /api/geocode?q=Address
// Nominatim geocoder proxy to fetch geo-coordinates safely and bypass rate limits
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query parameter "q" is required' });
  }

  const MAX_ATTEMPTS = 2;
  let lastErr;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetchFromNominatim(q, 3500);

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return res.json({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
        });
      }

      // A genuine "no results" response is Nominatim actually answering —
      // retrying the same unmatched query won't change that, so stop here.
      return res.status(404).json({ error: 'Coordinates not found for address' });
    } catch (err) {
      lastErr = err;
      console.error(`Geocoding proxy attempt ${attempt}/${MAX_ATTEMPTS} failed for "${q}":`, err.message);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  console.error(`Geocoding proxy giving up on "${q}" after ${MAX_ATTEMPTS} attempts:`, lastErr?.message);
  return res.status(503).json({ error: 'Location service is temporarily unavailable. Please try again in a moment.' });
});

module.exports = router;
