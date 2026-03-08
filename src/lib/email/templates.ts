const BASE_URL = 'https://triraceday.com'

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f9fafb;
  margin: 0;
  padding: 0;
`

const cardStyle = `
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  max-width: 520px;
  margin: 40px auto;
`

const headingStyle = `
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`

const bodyStyle = `
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 24px 0;
`

const buttonStyle = `
  display: inline-block;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 10px;
`

const footerStyle = `
  font-size: 12px;
  color: #9ca3af;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
`

const labelStyle = `
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #9ca3af;
  margin-bottom: 16px;
`

function wrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="${baseStyle}">
  <div style="${cardStyle}">
    <p style="${labelStyle}">TRI RACE DAY</p>
    ${content}
    <div style="${footerStyle}">
      <p style="margin:0">Tri Race Day · <a href="${BASE_URL}" style="color:#9ca3af">triraceday.com</a></p>
      <p style="margin:4px 0 0 0">You're receiving this because you have an account at Tri Race Day.</p>
    </div>
  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------
export function welcomeEmail(displayName: string): { subject: string; html: string } {
  return {
    subject: 'Welcome to Tri Race Day',
    html: wrapper(`
      <h1 style="${headingStyle}">Welcome, ${displayName}.</h1>
      <p style="${bodyStyle}">
        You're in. Tri Race Day uses your training data to predict your finish time
        before you cross the start line — across swim, bike, and run.
      </p>
      <p style="${bodyStyle}">
        To get your first projection, log at least 10 workouts across each discipline
        and set a target race. The more you train, the sharper the prediction.
      </p>
      <a href="${BASE_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
      <p style="${bodyStyle}; margin-top: 24px; font-size: 13px; color: #6b7280;">
        Questions? Reply to this email and we'll get back to you.
      </p>
    `),
  }
}

// ---------------------------------------------------------------------------
// New follower notification
// ---------------------------------------------------------------------------
export function newFollowerEmail(
  recipientName: string,
  followerName: string,
  isPending: boolean
): { subject: string; html: string } {
  return {
    subject: isPending
      ? `${followerName} requested to follow you on Tri Race Day`
      : `${followerName} started following you on Tri Race Day`,
    html: wrapper(`
      <h1 style="${headingStyle}">${isPending ? 'New follow request.' : 'You have a new follower.'}</h1>
      <p style="${bodyStyle}">
        <strong>${followerName}</strong> ${isPending ? 'has requested to follow you' : 'is now following you'} on Tri Race Day.
      </p>
      ${isPending ? `<p style="${bodyStyle}">Head to the social page to approve or decline the request.</p>` : ''}
      <a href="${BASE_URL}/dashboard/social" style="${buttonStyle}">${isPending ? 'Review Request' : 'View Social'}</a>
    `),
  }
}

// ---------------------------------------------------------------------------
// Race week reminder (7 days out)
// ---------------------------------------------------------------------------
export function raceWeekEmail(
  displayName: string,
  raceName: string,
  raceDate: string,
  raceId: string
): { subject: string; html: string } {
  const formatted = new Date(raceDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `Race week: ${raceName} is in 7 days`,
    html: wrapper(`
      <h1 style="${headingStyle}">Race week starts now.</h1>
      <p style="${bodyStyle}">
        <strong>${raceName}</strong> is one week away — <strong>${formatted}</strong>.
        Your projection is live and will update through race day as conditions sharpen.
      </p>
      <p style="${bodyStyle}">
        Check your race prediction, review your pacing plan, and make sure your
        race day timeline is set.
      </p>
      <a href="${BASE_URL}/dashboard/races/${raceId}" style="${buttonStyle}">View Race Prediction</a>
    `),
  }
}

// ---------------------------------------------------------------------------
// Race day reminder (1 day out)
// ---------------------------------------------------------------------------
export function raceDayEmail(
  displayName: string,
  raceName: string,
  raceDate: string,
  raceId: string
): { subject: string; html: string } {
  const formatted = new Date(raceDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return {
    subject: `Tomorrow is race day — ${raceName}`,
    html: wrapper(`
      <h1 style="${headingStyle}">Tomorrow is race day.</h1>
      <p style="${bodyStyle}">
        <strong>${raceName}</strong> is tomorrow — <strong>${formatted}</strong>.
        You've put in the work. Trust it.
      </p>
      <p style="${bodyStyle}">
        Review your race day timeline, check the weather forecast, and confirm
        your target pacing. Everything you need is in the app.
      </p>
      <a href="${BASE_URL}/dashboard/races/${raceId}/race-day" style="${buttonStyle}">Open Race Day View</a>
    `),
  }
}
