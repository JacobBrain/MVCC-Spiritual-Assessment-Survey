import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationData {
  firstName: string;
  lastName: string;
  email: string;
  topGifts: { gift: string; score: number }[];
  teamInterests: string[];
  assessmentId: string;
}

export async function sendAssessmentNotification(data: NotificationData) {
  const notifyEmails = process.env.NOTIFICATION_EMAIL?.split(',').map(e => e.trim()).filter(Boolean);
  if (!notifyEmails || notifyEmails.length === 0) {
    console.warn('NOTIFICATION_EMAIL not set — skipping notification');
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mvcc-spiritual-gifts.vercel.app';
  const resultsUrl = `${baseUrl}/results/${data.assessmentId}`;
  const adminUrl = `${baseUrl}/admin/${data.assessmentId}`;

  const giftsFormatted = data.topGifts
    .map((g, i) => `${i + 1}. ${g.gift} (${g.score}/16)`)
    .join('\n');

  const teamsFormatted = data.teamInterests.length > 0
    ? data.teamInterests.join(', ')
    : 'None selected';

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'MVCC Gifts Assessment <onboarding@resend.dev>',
    to: notifyEmails,
    subject: `New Assessment: ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">New Spiritual Gifts Assessment</h2>
        <p><strong>${data.firstName} ${data.lastName}</strong> just completed the assessment.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px 12px; background: #f3f4f6; font-weight: bold;">Email</td>
            <td style="padding: 8px 12px; background: #f3f4f6;">${data.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; vertical-align: top;">Top Gifts</td>
            <td style="padding: 8px 12px;">
              ${data.topGifts.map((g, i) => `${i + 1}. <strong>${g.gift}</strong> (${g.score}/16)`).join('<br>')}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f3f4f6; font-weight: bold;">Teams Interested In</td>
            <td style="padding: 8px 12px; background: #f3f4f6;">${teamsFormatted}</td>
          </tr>
        </table>

        <div style="margin: 24px 0;">
          <a href="${resultsUrl}" style="display: inline-block; padding: 10px 20px; background: #1e3a5f; color: white; text-decoration: none; border-radius: 6px; margin-right: 8px;">View Results</a>
          <a href="${adminUrl}" style="display: inline-block; padding: 10px 20px; background: #6b7280; color: white; text-decoration: none; border-radius: 6px;">Admin View</a>
        </div>

        <p style="color: #6b7280; font-size: 12px;">This is an automated notification from the MVCC Spiritual Gifts Assessment.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send notification email:', error);
  }
}
