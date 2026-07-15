import multer from 'multer'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

// Some clients send HEIC/HEIF photos with an empty or generic mimetype, so we
// also accept them based on the file extension.
const isAllowed = (file) =>
  ALLOWED_MIME_TYPES.includes(file.mimetype) || /\.hei[cf]$/i.test(file.originalname || '')

const storage = multer.memoryStorage()

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(req, file, cb) {
    if (!isAllowed(file)) {
      return cb(new Error('Only JPEG, PNG, WEBP, or HEIC images are allowed'))
    }
    cb(null, true)
  },
}).single('image')

export function handleUpload(req, res, next) {
  uploadImage(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (req.file && !process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({ error: 'Image uploads are not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the server .env.' })
    }
    next()
  })
}
