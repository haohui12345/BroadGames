const LOCAL_CLIENT_ORIGINS = ['http://localhost:5173', 'https://localhost:5173']

function buildAllowedOrigins() {
  const configuredOrigins = process.env.CLIENT_URL
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return configuredOrigins?.length ? configuredOrigins : LOCAL_CLIENT_ORIGINS
}

function createCorsOriginHandler() {
  const allowedOrigins = buildAllowedOrigins()

  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  }
}

function createCorsOptions() {
  return {
    origin: createCorsOriginHandler(),
    credentials: true,
  }
}

module.exports = {
  buildAllowedOrigins,
  createCorsOptions,
}
