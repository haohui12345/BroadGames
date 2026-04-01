const express = require('express')
const router = express.Router()
const { getApiDocs } = require('../controllers/docsController')

// Docs mở trực tiếp trên browser.
router.get('/', getApiDocs)

module.exports = router
