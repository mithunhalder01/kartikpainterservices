// express-mongo-sanitize reassigns req.query, which Express 5 makes getter-only
// (throws "Cannot set property query"), so we mutate objects in place instead.
function stripMongoOperators(value) {
  if (Array.isArray(value)) {
    value.forEach(stripMongoOperators)
    return value
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key]
      } else {
        stripMongoOperators(value[key])
      }
    }
  }
  return value
}

export function sanitizeRequest(req, res, next) {
  if (req.body) stripMongoOperators(req.body)
  if (req.params) stripMongoOperators(req.params)
  if (req.query) stripMongoOperators(req.query)
  next()
}
