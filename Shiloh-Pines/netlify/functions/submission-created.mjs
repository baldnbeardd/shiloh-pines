import { neon } from '@neondatabase/serverless';
import twilio from 'twilio';

const sql = neon(process.env.DATABASE_URL);
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const handler = async (event) => {
  console.log('Function triggered! Event body:', event.body);

  try {
    const payload = JSON.parse(event.body).payload;

    const name = payload.name;
    const email = payload.email;
    const phone = payload.phone;
    const attachmentUrl = payload.attachment || "No file";

    await sql`
      INSERT INTO submissions (name, email, phone, attachment_url)
      VALUES (${name}, ${email}, ${phone}, ${attachmentUrl})
    `;

    await client.messages.create({
      body: `📨 New submission!\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nAttachment: ${attachmentUrl}`,
      from: process.env.TWILIO_PHONE,
      to: process.env.MY_PHONE
    });

    return { statusCode: 200 };
  } catch (err) {
    console.error(err);
    return { statusCode: 500 };
  }
};
