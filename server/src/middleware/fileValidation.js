const multer = require('multer');
const path   = require('path');

// ── Allowed MIME types ────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

// ── Multer storage (memory — for Cloudinary upload) ───────────
const storage = multer.memoryStorage();

// ── File filter ───────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const ext      = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  // Check both extension AND mime type
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File type not allowed. Accepted: JPG, PNG, PDF. Got: ${ext}`), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return cb(new Error(`Invalid file format. Accepted: JPEG, PNG, PDF. Got: ${mimeType}`), false);
  }

  // Reject if extension and mime type don't match (e.g. .jpg file with PDF mime)
  const mimeExtMap = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg':  ['.jpg', '.jpeg'],
    'image/png':  ['.png'],
    'application/pdf': ['.pdf'],
  };

  const allowedExtsForMime = mimeExtMap[mimeType] || [];
  if (!allowedExtsForMime.includes(ext)) {
    return cb(new Error('File extension does not match file content. Possible tampering detected.'), false);
  }

  cb(null, true);
};

// ── Multer instance ───────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize:  5 * 1024 * 1024, // 5MB max
    files:     4,               // max 4 files per request
  },
});

// ── KYC document upload middleware ────────────────────────────
// Accepts up to 4 files, field name "documents"
const uploadKYCDocs = upload.array('documents', 4);

// ── Error handler for multer ──────────────────────────────────
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB per file.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 4 documents per submission.',
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};

// ── Validate image dimensions (reject tiny screenshots) ───────
const MIN_IMAGE_WIDTH  = 400;
const MIN_IMAGE_HEIGHT = 300;

const validateImageDimensions = async (buffer, mimetype) => {
  // Basic PNG dimension check from file header
  if (mimetype === 'image/png' && buffer.length > 24) {
    const width  = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
      throw new Error(
        `Image too small (${width}x${height}px). Minimum: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px. Please upload a clear, full-size document photo.`
      );
    }
  }
  // JPEG dimension check from EXIF/SOF markers
  if ((mimetype === 'image/jpeg' || mimetype === 'image/jpg') && buffer.length > 4) {
    // Basic check — just ensure it's a real JPEG (starts with FF D8)
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
      throw new Error('Invalid JPEG file. The file may be corrupted or is not a real image.');
    }
  }
};

module.exports = {
  upload,
  uploadKYCDocs,
  handleUploadError,
  validateImageDimensions,
};
