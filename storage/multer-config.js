const path = require('path');
const multer = require('multer');

const fileFilter = (file, cb) => {
  const allowedFileTypes = /jpg|jpeg|png/;
  const extensionType = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (extensionType && mimeType) {
    return cb(null, true);
  }
  return cb('The crest image must be a JPG, JPEG, or PNG file up to 1.5mb.');
};

const storage = multer.diskStorage({
  destination: './public/assets/uploads',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    fileFilter(file, cb);
  },
  limits: {
    fileSize: 1500000
  }
}).single('club_crest');

module.exports = upload;
