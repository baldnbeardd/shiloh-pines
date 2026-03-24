import nodemailer from 'nodemailer';

export const handler = async (event) => {
  try {
    const payload = JSON.parse(event.body).payload;

    // Form field values live in payload.data; name/email also at top level
    const data = payload.data || {};
    const name = data.name || payload.name || '';
    const email = data.email || payload.email || '';
    const phone = data.phone || payload.phone || '';
    const message = data.message || '';
    const attachmentUrl = data.attachment || payload.attachment || null;

    // ── Send email with attachment ─────────────────────────────────
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: gmailUser, pass: gmailPass }
      });

      const mailOptions = {
        from: gmailUser,
        to: gmailUser,
        replyTo: email,
        subject: `New Showing Request from ${name}`,
        html: [
          '<h2>New Showing Request</h2>',
          `<p><strong>Name:</strong> ${name}</p>`,
          `<p><strong>Email:</strong> ${email}</p>`,
          `<p><strong>Phone:</strong> ${phone}</p>`,
          `<p><strong>Message:</strong> ${message || 'N/A'}</p>`,
        ].join('\n'),
        attachments: []
      };

      if (attachmentUrl) {
        try {
          // Build full URL if the value is a relative path
          let fileUrl = attachmentUrl;
          if (!attachmentUrl.startsWith('http')) {
            const siteUrl = process.env.URL || 'https://shiloh-pines.netlify.app';
            fileUrl = siteUrl + (attachmentUrl.startsWith('/') ? '' : '/') + attachmentUrl;
          }

          const response = await fetch(fileUrl);
          if (response.ok) {
            const buffer = Buffer.from(await response.arrayBuffer());
            const filename = decodeURIComponent(fileUrl.split('/').pop()) || 'pre-approval-letter';
            mailOptions.attachments.push({
              filename,
              content: buffer,
              contentType: response.headers.get('content-type') || 'application/octet-stream'
            });
            mailOptions.html += '<p><em>Bank pre-approval letter is attached.</em></p>';
          } else {
            console.error('Attachment download returned status:', response.status);
            mailOptions.html += `<p><strong>Attachment link:</strong> <a href="${fileUrl}">${fileUrl}</a></p>`;
          }
        } catch (dlErr) {
          console.error('Failed to download attachment:', dlErr);
          mailOptions.html += `<p><strong>Attachment URL (download failed):</strong> ${attachmentUrl}</p>`;
        }
      } else {
        mailOptions.html += '<p><em>No attachment was provided.</em></p>';
      }

      await transporter.sendMail(mailOptions);
    } else {
      console.warn('GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping email.');
    }

    return { statusCode: 200 };
  } catch (err) {
    console.error('submission-created error:', err);
    return { statusCode: 500 };
  }
};
