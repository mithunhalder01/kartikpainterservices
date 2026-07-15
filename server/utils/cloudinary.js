import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export function uploadBuffer(buffer, folder, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', ...options },
      (err, result) => (err ? reject(err) : resolve(result)),
    )
    stream.end(buffer)
  })
}

// Uploads a multer file, converting HEIC/HEIF (iPhone) photos to JPEG so the
// delivered URL is displayable in every browser.
export function uploadImageFile(file, folder) {
  const isHeic =
    /image\/hei(c|f)/i.test(file.mimetype || '') || /\.hei[cf]$/i.test(file.originalname || '')
  return uploadBuffer(file.buffer, folder, isHeic ? { format: 'jpg' } : {})
}

export function destroyAsset(publicId) {
  if (!publicId) return Promise.resolve()
  return cloudinary.uploader.destroy(publicId).catch(() => {})
}

export default cloudinary
