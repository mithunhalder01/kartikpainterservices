const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

// Some browsers report an empty mimetype for .heic files, so we also sniff the
// file extension.
export const isHeic = (file) =>
  /image\/hei(c|f)/i.test(file.type) || /\.hei[cf]$/i.test(file.name || '')

// Returns a browser-displayable, upload-ready File. HEIC/HEIF (iPhone) photos
// are converted to JPEG in the browser. Throws an Error with a user-friendly
// message if the file is unsupported, too large, or conversion fails.
export async function prepareImageFile(file) {
  if (!file) throw new Error('No file selected')
  if (file.size > MAX_SIZE_BYTES) throw new Error('Image must be under 5MB')

  if (isHeic(file)) {
    let converted
    try {
      const { default: heic2any } = await import('heic2any')
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
      converted = Array.isArray(blob) ? blob[0] : blob
    } catch {
      throw new Error('Could not convert this HEIC image. Please try a JPG or PNG.')
    }
    const jpegName = (file.name || 'image').replace(/\.hei[cf]$/i, '') + '.jpg'
    return new File([converted], jpegName, { type: 'image/jpeg' })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WEBP, or HEIC images are allowed')
  }
  return file
}
