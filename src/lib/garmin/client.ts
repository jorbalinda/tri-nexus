/**
 * Garmin Connect API Client
 * Uses OAuth 1.0a for authentication.
 * Garmin pushes activity data via webhooks after initial connection.
 */

import crypto from 'crypto'

const GARMIN_BASE_URL = 'https://connectapi.garmin.com'
const GARMIN_REQUEST_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/request_token'
const GARMIN_AUTHORIZE_URL = 'https://connect.garmin.com/oauthConfirm'
const GARMIN_ACCESS_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/access_token'

interface OAuthTokens {
  oauth_token: string
  oauth_token_secret: string
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex')
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString()
}

function buildSignatureBaseString(method: string, url: string, params: Record<string, string>): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
    .join('&')

  return `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(sortedParams)}`
}

function signRequest(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  const baseString = buildSignatureBaseString(method, url, params)
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64')
}

function buildOAuthParams(consumerKey: string, token?: string): Record<string, string> {
  const params: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: generateTimestamp(),
    oauth_version: '1.0',
  }
  if (token) params.oauth_token = token
  return params
}

function buildAuthorizationHeader(params: Record<string, string>): string {
  const entries = Object.entries(params)
    .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
    .join(', ')
  return `OAuth ${entries}`
}

/**
 * Step 1: Get a request token to begin the OAuth flow.
 */
export async function getRequestToken(callbackUrl: string): Promise<OAuthTokens> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY!
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET!

  const params: Record<string, string> = {
    ...buildOAuthParams(consumerKey),
    oauth_callback: callbackUrl,
  }

  params.oauth_signature = signRequest('POST', GARMIN_REQUEST_TOKEN_URL, params, consumerSecret)

  const response = await fetch(GARMIN_REQUEST_TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: buildAuthorizationHeader(params) },
  })

  const text = await response.text()
  const parsed = Object.fromEntries(new URLSearchParams(text))

  return {
    oauth_token: parsed.oauth_token,
    oauth_token_secret: parsed.oauth_token_secret,
  }
}

/**
 * Get the URL to redirect user to for Garmin authorization.
 */
export function getAuthorizeUrl(requestToken: string): string {
  return `${GARMIN_AUTHORIZE_URL}?oauth_token=${requestToken}`
}

/**
 * Step 3: Exchange verifier for access token.
 */
export async function getAccessToken(
  requestToken: string,
  requestTokenSecret: string,
  verifier: string
): Promise<OAuthTokens> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY!
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET!

  const params: Record<string, string> = {
    ...buildOAuthParams(consumerKey, requestToken),
    oauth_verifier: verifier,
  }

  params.oauth_signature = signRequest(
    'POST',
    GARMIN_ACCESS_TOKEN_URL,
    params,
    consumerSecret,
    requestTokenSecret
  )

  const response = await fetch(GARMIN_ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: buildAuthorizationHeader(params) },
  })

  const text = await response.text()
  const parsed = Object.fromEntries(new URLSearchParams(text))

  return {
    oauth_token: parsed.oauth_token,
    oauth_token_secret: parsed.oauth_token_secret,
  }
}

/**
 * Make an authenticated GET request to Garmin API.
 */
export async function garminApiGet(
  url: string,
  accessToken: string,
  tokenSecret: string
): Promise<Response> {
  const consumerKey = process.env.GARMIN_CONSUMER_KEY!
  const consumerSecret = process.env.GARMIN_CONSUMER_SECRET!

  const params = buildOAuthParams(consumerKey, accessToken)
  params.oauth_signature = signRequest('GET', url, params, consumerSecret, tokenSecret)

  return fetch(url, {
    headers: { Authorization: buildAuthorizationHeader(params) },
  })
}

/**
 * Fetch activities from Garmin for a date range.
 */
export async function getActivities(
  accessToken: string,
  tokenSecret: string,
  startDate: string,
  endDate: string
) {
  const url = `${GARMIN_BASE_URL}/fitness-api/activities?startDate=${startDate}&endDate=${endDate}`
  const response = await garminApiGet(url, accessToken, tokenSecret)
  if (!response.ok) return []
  return response.json()
}

/**
 * Fetch sleep data from Garmin.
 */
export async function getSleepData(
  accessToken: string,
  tokenSecret: string,
  date: string
) {
  const url = `${GARMIN_BASE_URL}/wellness-api/wellness/dailySleepData/${date}`
  const response = await garminApiGet(url, accessToken, tokenSecret)
  if (!response.ok) return null
  return response.json()
}

/**
 * Validate a Garmin webhook signature.
 */
export function validateWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.GARMIN_WEBHOOK_SECRET!
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return computed === signature
}
