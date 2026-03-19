{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fmodern\fcharset0 Courier;\f1\fnil\fcharset0 AppleColorEmoji;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26\fsmilli13333 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 console.log('Function triggered! Event body:', event.body);
\fs26\fsmilli13333 \outl0\strokewidth0 \
\pard\pardeftab720\partightenfactor0
\cf0 import \{ neon \} from '@neondatabase/serverless';\
import twilio from 'twilio';\
\
const sql = neon(process.env.DATABASE_URL);\
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);\
\
export const handler = async (event) => \{\
  try \{\
    const payload = JSON.parse(event.body).payload;\
\
    const name = payload.name;\
    const email = payload.email;\
    const phone = payload.phone;\
    const attachmentUrl = payload.attachment || "No file";\
\
    await sql`\
      INSERT INTO submissions (name, email, phone, attachment_url)\
      VALUES ($\{name\}, $\{email\}, $\{phone\}, $\{attachmentUrl\})\
    `;\
\
    await client.messages.create(\{\
      body: `
\f1 \uc0\u55357 \u57000 
\f0  New submission!\\nName: $\{name\}\\nEmail: $\{email\}\\nPhone: $\{phone\}\\nAttachment: $\{attachmentUrl\}`,\
      from: process.env.TWILIO_PHONE,\
      to: process.env.MY_PHONE\
    \});\
\
    return \{ statusCode: 200 \};\
  \} catch (err) \{\
    console.error(err);\
    return \{ statusCode: 500 \};\
  \}\
\};\
}