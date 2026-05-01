const cloudinary = require('cloudinary').v2;

// Configure from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a base64 file to Cloudinary
 * @param {string} base64Data  - base64 encoded file (with or without data URI prefix)
 * @param {string} folder      - Cloudinary folder name
 * @param {string} publicId    - optional public ID
 * @returns {Promise<{url, secureUrl, publicId}>}
 */
const uploadToCloudinary = async (base64Data, folder = 'gaib/kyc', publicId = null) => {
  const opts = {
    folder,
    resource_type: 'auto',
    quality:       'auto',
    fetch_format:  'auto',
  };
  if (publicId) opts.public_id = publicId;

  const result = await cloudinary.uploader.upload(base64Data, opts);
  return {
    url:       result.secure_url,
    secureUrl: result.secure_url,
    publicId:  result.public_id,
    format:    result.format,
    bytes:     result.bytes,
  };
};

/**
 * Delete a file from Cloudinary by public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    console.warn('[Cloudinary] Delete failed:', e.message);
  }
};

/**
 * Check if Cloudinary is configured
 */
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured };
