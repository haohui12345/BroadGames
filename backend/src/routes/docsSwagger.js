const express = require('express')
const router = express.Router()
const { getSwaggerUi, getOpenApiSpec } = require('../controllers/docsSwaggerController')
const { authenticateDocsToken } = require('../middlewares/docsAuth')
const { requireApiKey } = require('../middlewares/apiKey')

router.use(authenticateDocsToken, requireApiKey)
router.get('/', getSwaggerUi)
router.get('/openapi.json', getOpenApiSpec)

module.exports = router
