const jwt = require('jsonwebtoken')

/**
 * Auth cho api-docs:
 * - Cho phep Bearer token trong header
 * - Hoac token qua query ?token=... de mo duoc tren browser
 */
const authenticateDocsToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  let token = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.query?.token) {
    token = req.query.token
  }

  if (!token) {
    return res.status(401).json({ message: 'Khong co token xac thuc de xem api-docs' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token api-docs khong hop le hoac da het han' })
  }
}

module.exports = { authenticateDocsToken }
