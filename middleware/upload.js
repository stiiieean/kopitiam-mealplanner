const multer = require('multer');
const path = require('path');

// Store uploaded files in public/uploads/forum/ with a timestamp-based filename
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/forum/');
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  }
});

// Only accept image files
const fileFilter = function(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) are allowed.'), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});
