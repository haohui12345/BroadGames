const express = require('express')
const router = express.Router()
const { getApiDocs } = require('../controllers/docsController')
const { authenticateToken } = require('../middlewares/auth')
const { requireApiKey } = require('../middlewares/apiKey')

// Route docs duoc bao ve o muc co ban: can login va can x-api-key.
router.get('/', authenticateToken, requireApiKey, getApiDocs)

module.exports = router
