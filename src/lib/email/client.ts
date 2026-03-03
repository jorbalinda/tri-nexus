import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)
export const FROM_EMAIL = 'noreply@triraceday.com'
export const FROM_NAME = 'Tri Race Day'
export const FROM = `${FROM_NAME} <${FROM_EMAIL}>`
