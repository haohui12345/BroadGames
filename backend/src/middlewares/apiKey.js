/**
 * Middleware kiem tra x-api-key cho cac route can bao ve bo sung.
 * Muc tieu chi la dap ung yeu cau co API key o muc co ban.
 */
const requireApiKey = (req, res, next) => {
  const expectedKey = process.env.DOCS_API_KEY || 'student-docs-key'
  const providedKey = req.headers['x-api-key'] || req.query?.apiKey

  if (!providedKey) {
    return res.status(401).json({ message: 'Thieu x-api-key' })
  }

  if (providedKey !== expectedKey) {
    return res.status(403).json({ message: 'API key khong hop le' })
  }

  next()
}

module.exports = { requireApiKey }
