// ADD THIS ROUTE to your existing server/src/routes/users.js
// Place it after the existing /kyc POST route

// Admin approves/rejects KYC
router.put('/:id/kyc', protect, authorize('admin'), async (req, res) => {
  try {
    const { kycVerified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        kycVerified,
        // Mark all docs as verified when admin approves
        ...(kycVerified && {
          'kycDocuments.$[].verified': true,
          kycVerifiedAt: new Date(),
        }),
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Notify user by email
    if (kycVerified) {
      const { sendKYCApprovedEmail } = require('../services/emailService');
      sendKYCApprovedEmail(user.email, user.firstName).catch(console.error);
    }

    res.json({ success: true, message: `KYC ${kycVerified ? 'approved' : 'rejected'}`, data: user });
  } catch (error) {
    console.error('KYC update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update KYC status' });
  }
});
