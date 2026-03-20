const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    const { name, email, message, file } = JSON.parse(event.body);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'shilohpines4503@gmail.com', // Replace with your email
            pass: 'rzkv ltmq apds revr' // Replace with your email password or app password
        }
    });

    // Setup email data
    const mailOptions = {
        from: email,
        to: 'shilohpines4503@gmail.com', // Replace with recipient email
        subject: 'Contact Form Submission',
        text: message,
        attachments: [{
            filename: file.name,
            content: file.content,
            encoding: 'base64'
        }]
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email sent successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send email', error })
        };
    }
};
