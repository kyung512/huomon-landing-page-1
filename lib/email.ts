import nodemailer from "nodemailer"

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export interface EmailData {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(data: EmailData) {
  try {
    const info = await transporter.sendMail({
      from: `"ManifestVault" <${process.env.EMAIL_FROM}>`,
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export function generateOrderConfirmationEmail(name: string, meditationPurpose: string) {
  const subject = "Your ManifestVault Meditation Package - Order Confirmation"

  const text = `
    Hello ${name},

    Thank you for your purchase from ManifestVault!

    We're excited to confirm that your order for a personalized meditation package has been received and is now being created specifically for you.

    Order Details:
    - Package: Custom Meditation Package
    - Focus Area: ${meditationPurpose || "Personal Growth"}
    - Amount: $29.00 USD

    What happens next:
    1. Our team is now creating your personalized meditation package based on the information you provided.
    2. Within the next 48 hours, you'll receive another email with access to your custom meditations.
    3. You'll have lifetime access to your meditation package, including any future updates.

    If you have any questions or need assistance, please reply to this email or contact us at contact@manifestvault.com.

    Thank you for investing in your transformation journey with ManifestVault.

    Wishing you abundance and success,
    The ManifestVault Team
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ManifestVault Order Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(to right, #9333ea, #6366f1);
          color: white;
        }
        .content {
          padding: 20px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        h1 {
          color: #ffffff;
          margin: 0;
        }
        h2 {
          color: #6366f1;
        }
        .order-details {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #e0b76a;
          color: #000000;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ManifestVault</h1>
        </div>
        <div class="content">
          <h2>Order Confirmation</h2>
          <p>Hello ${name},</p>
          <p>Thank you for your purchase from ManifestVault! We're excited to confirm that your order for a personalized meditation package has been received and is now being created specifically for you.</p>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            <p><strong>Package:</strong> Custom Meditation Package</p>
            <p><strong>Focus Area:</strong> ${meditationPurpose || "Personal Growth"}</p>
            <p><strong>Amount:</strong> $29.00 USD</p>
          </div>
          
          <h3>What happens next:</h3>
          <ol>
            <li>Our team is now creating your personalized meditation package based on the information you provided.</li>
            <li>Within the next 48 hours, you'll receive another email with access to your custom meditations.</li>
            <li>You'll have lifetime access to your meditation package, including any future updates.</li>
          </ol>
          
          <p>If you have any questions or need assistance, please reply to this email or contact us at <a href="mailto:contact@manifestvault.com">contact@manifestvault.com</a>.</p>
          
          <p>Thank you for investing in your transformation journey with ManifestVault.</p>
          
          <p>Wishing you abundance and success,<br>The ManifestVault Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ManifestVault. All rights reserved.</p>
          <p>This email was sent to ${name} at ${name}.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}

// New function for admin notification emails
export function generateAdminOrderNotificationEmail(
  customerName: string,
  customerEmail: string,
  meditationPurpose: string,
  sessionId: string,
  formData?: any,
) {
  const subject = `New Order: ${customerName} - ManifestVault`

  const formDataText = formData
    ? `
    Form Submission Details:
    - Limiting Beliefs: ${formData.limiting_beliefs || "Not provided"}
    - Conscious Struggles: ${formData.conscious_struggles || "Not provided"}
    - Specific Objective: ${formData.specific_objective || "Not provided"}
    - Meditation Style: ${formData.meditation_style || "Not provided"}
    - Voice Gender: ${formData.voice_gender || "Not provided"}
    - Voice Tonality: ${formData.voice_tonality || "Not provided"}
    - Dream Life Visualization: ${formData.dream_life_visualization || "Not provided"}
    - Additional Info: ${formData.additional_info || "Not provided"}
    `
    : ""

  const text = `
    New Order Notification

    A new order has been placed on ManifestVault!

    Order Details:
    - Customer: ${customerName}
    - Email: ${customerEmail}
    - Package: Custom Meditation Package
    - Focus Area: ${meditationPurpose || "Personal Growth"}
    - Amount: $29.00 USD
    - Payment ID: ${sessionId}
    - Date: ${new Date().toLocaleString()}

    ${formDataText}

    Please begin creating the custom meditation package for this customer.
    They have been informed that they will receive their package within 48 hours.

    This is an automated notification from the ManifestVault system.
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Notification - ManifestVault</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: linear-gradient(to right, #9333ea, #6366f1);
          color: white;
        }
        .content {
          padding: 20px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        h1 {
          color: #ffffff;
          margin: 0;
        }
        h2 {
          color: #6366f1;
        }
        .order-details {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .customer-details {
          background-color: #f9f0ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #9333ea;
        }
        .form-details {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #6366f1;
        }
        .detail-row {
          margin-bottom: 8px;
        }
        .highlight {
          color: #9333ea;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ManifestVault Admin</h1>
        </div>
        <div class="content">
          <h2>🎉 New Order Notification</h2>
          <p>A new order has been placed on ManifestVault!</p>
          
          <div class="customer-details">
            <h3>Customer Information:</h3>
            <div class="detail-row"><strong>Name:</strong> ${customerName}</div>
            <div class="detail-row"><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></div>
          </div>
          
          <div class="order-details">
            <h3>Order Details:</h3>
            <div class="detail-row"><strong>Package:</strong> Custom Meditation Package</div>
            <div class="detail-row"><strong>Focus Area:</strong> <span class="highlight">${meditationPurpose || "Personal Growth"}</span></div>
            <div class="detail-row"><strong>Amount:</strong> $29.00 USD</div>
            <div class="detail-row"><strong>Payment ID:</strong> ${sessionId}</div>
            <div class="detail-row"><strong>Date:</strong> ${new Date().toLocaleString()}</div>
          </div>
          
          ${
            formData
              ? `
          <div class="form-details">
            <h3>Form Submission Details:</h3>
            <div class="detail-row"><strong>Limiting Beliefs:</strong> ${formData.limiting_beliefs || "Not provided"}</div>
            <div class="detail-row"><strong>Conscious Struggles:</strong> ${formData.conscious_struggles || "Not provided"}</div>
            <div class="detail-row"><strong>Specific Objective:</strong> ${formData.specific_objective || "Not provided"}</div>
            <div class="detail-row"><strong>Meditation Style:</strong> ${formData.meditation_style || "Not provided"}</div>
            <div class="detail-row"><strong>Voice Gender:</strong> ${formData.voice_gender || "Not provided"}</div>
            <div class="detail-row"><strong>Voice Tonality:</strong> ${formData.voice_tonality || "Not provided"}</div>
            <div class="detail-row"><strong>Dream Life Visualization:</strong> ${formData.dream_life_visualization || "Not provided"}</div>
            <div class="detail-row"><strong>Additional Info:</strong> ${formData.additional_info || "Not provided"}</div>
          </div>
          `
              : ""
          }
          
          <p><strong>Action Required:</strong> Please begin creating the custom meditation package for this customer. They have been informed that they will receive their package within 48 hours.</p>
          
        </div>
        <div class="footer">
          <p>This is an automated notification from the ManifestVault system.</p>
          <p>&copy; ${new Date().getFullYear()} ManifestVault. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}
