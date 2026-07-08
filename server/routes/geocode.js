const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/geocode?q=Address
// Nominatim geocoder proxy to fetch geo-coordinates safely and bypass rate limits
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query parameter "q" is required' });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'FoodLoop-Rescue-App-Client-v1',
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return res.json({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name,
      });
    }

    return res.status(404).json({ error: 'Coordinates not found for address' });
  } catch (err) {
    console.error('Geocoding proxy failure:', err.message);
    return res.status(500).json({ error: 'Failed to geocode address' });
  }
});

module.exports = router;
