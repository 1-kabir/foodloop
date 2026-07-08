const express = require('express');
const { supabaseAdmin } = require('../db');
const router = express.Router();

// POST /api/claims/verify
// Validate QR token upon NGO arrival and finalize verification
router.post('/verify', async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ error: 'qrToken is required' });
    }

    // 1. Fetch claims matching token
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('qr_token', qrToken)
      .eq('status', 'confirmed')
      .single();

    if (claimError || !claim) {
      return res.status(404).json({ error: 'Valid claim reservation not found' });
    }

    // 2. Begin transaction context via parallel updates
    // A. Update claim status to completed
    const { error: updateClaimErr } = await supabaseAdmin
      .from('claims')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', claim.id);

    if (updateClaimErr) {
      return res.status(500).json({ error: 'Failed to update claim state' });
    }

    // B. Fetch corresponding listing
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('*')
      .eq('id', claim.listing_id)
      .single();

    if (listing) {
      // C. Update quantity and status on original listing
      const newQtyRemaining = Math.max(0, listing.qty_remaining_kg - claim.qty_claimed_kg);
      const newStatus = newQtyRemaining === 0 ? 'collected' : 'partial';

      await supabaseAdmin
        .from('listings')
        .update({ qty_remaining_kg: newQtyRemaining, status: newStatus })
        .eq('id', listing.id);
    }

    return res.json({ success: true, message: 'Pickup verification completed successfully' });
  } catch (err) {
    console.error('QR verification failure:', err);
    return res.status(500).json({ error: 'Internal verification loop error' });
  }
});

module.exports = router;
