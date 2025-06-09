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

export function generateOrderConfirmationEmail(
  name: string,
  meditationPurpose: string,
  paymentId: string,
  sessionIdentifier?: string,
) {
  const subject = "Your ManifestVault Meditation Package - Order Confirmation"

  const text = `
    Hello ${name},

    Thank you for your purchase from ManifestVault!

    We're excited to confirm that your order for a personalized meditation package has been received and is now being created specifically for you.

    Order Details:
    - Package: Custom Meditation Package
    - Focus Area: ${meditationPurpose || "Personal Growth"}
    - Amount: $29.00 USD
    - Order ID: ${paymentId}
    ${sessionIdentifier ? `- Session ID: ${sessionIdentifier}` : ""}

    What happens next:
    1. Our team is now creating your personalized meditation package based on the information you provided.
    2. Within the next 48 hours, you'll receive another email with access to your custom meditations.
    3. You'll have lifetime access to your meditation package, including any future updates.

    If you have any questions or need assistance, please reply to this email or contact us at contact@manifestvault.com. 
    ${sessionIdentifier ? `Please include your Session ID (${sessionIdentifier}) in any correspondence for faster support.` : ""}

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
        .session-info {
          background-color: #f0f8ff;
          padding: 12px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #6366f1;
        }
        .session-id {
          font-family: monospace;
          background-color: #e8f4f8;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          color: #2563eb;
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
            <p><strong>Order ID:</strong> ${paymentId}</p>
            ${sessionIdentifier ? `<p><strong>Session ID:</strong> <span class="session-id">${sessionIdentifier}</span></p>` : ""}
          </div>

          ${
            sessionIdentifier
              ? `
          <div class="session-info">
            <h4>📋 For Your Records</h4>
            <p>Your Session ID is: <strong class="session-id">${sessionIdentifier}</strong></p>
            <p>Please save this Session ID for your records. Include it in any correspondence with our support team for faster assistance.</p>
          </div>
          `
              : ""
          }
          
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
          <p>This email was sent to ${name}.</p>
          ${sessionIdentifier ? `<p>Session ID: ${sessionIdentifier}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}

// Admin notification email with complete form details
export function generateAdminOrderNotificationEmail(
  customerName: string,
  customerEmail: string,
  meditationPurpose: string,
  paymentId: string,
  formData?: any,
) {
  const subject = `New Order: ${customerName} - ManifestVault`

  // Ensure we have form data and extract the details
  const limitingBeliefs = formData?.limiting_beliefs || "Not provided"
  const consciousStruggles = formData?.conscious_struggles || "Not provided"
  const specificObjective = formData?.specific_objective || "Not provided"
  const meditationStyle = formData?.meditation_style || "Not provided"
  const voiceGender = formData?.voice_gender || "Not provided"
  const voiceTonality = formData?.voice_tonality || "Not provided"
  const dreamLifeVisualization = formData?.dream_life_visualization || "Not provided"
  const additionalInfo = formData?.additional_info || "Not provided"
  const customVoiceUrl = formData?.custom_voice_url || "No custom voice uploaded"
  const sessionIdentifier = formData?.session_identifier || "Not available"

  const text = `
    New Order Notification

    A new order has been placed on ManifestVault!

    Order Details:
    - Customer: ${customerName}
    - Email: ${customerEmail}
    - Package: Custom Meditation Package
    - Focus Area: ${meditationPurpose || "Personal Growth"}
    - Amount: $29.00 USD
    - Payment ID: ${paymentId}
    - Session ID: ${sessionIdentifier}
    - Date: ${new Date().toLocaleString()}

    Form Submission Details:
    - Limiting Beliefs: ${limitingBeliefs}
    - Conscious Struggles: ${consciousStruggles}
    - Specific Objective: ${specificObjective}
    - Meditation Style: ${meditationStyle}
    - Voice Gender: ${voiceGender}
    - Voice Tonality: ${voiceTonality}
    - Dream Life Visualization: ${dreamLifeVisualization}
    - Additional Info: ${additionalInfo}
    - Custom Voice: ${customVoiceUrl}

    Technical Information:
    - Session Identifier: ${sessionIdentifier}
    - Payment ID: ${paymentId}
    - Database Record ID: ${formData?.id || "Unknown"}

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
          max-width: 700px;
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
        .technical-details {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #28a745;
        }
        .detail-row {
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .highlight {
          color: #9333ea;
          font-weight: bold;
        }
        .form-field {
          margin-bottom: 15px;
        }
        .form-field strong {
          color: #6366f1;
          display: block;
          margin-bottom: 5px;
        }
        .form-field-content {
          background-color: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          border-left: 3px solid #6366f1;
        }
        .session-id {
          font-family: monospace;
          background-color: #e8f4f8;
          padding: 4px 8px;
          border-radius: 3px;
          font-size: 12px;
          color: #2563eb;
        }
        .tech-field {
          margin-bottom: 10px;
        }
        .tech-field strong {
          color: #28a745;
          margin-right: 10px;
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
            <div class="detail-row"><strong>Payment ID:</strong> ${paymentId}</div>
            <div class="detail-row"><strong>Session ID:</strong> <span class="session-id">${sessionIdentifier}</span></div>
            <div class="detail-row"><strong>Date:</strong> ${new Date().toLocaleString()}</div>
          </div>

          <div class="technical-details">
            <h3>🔧 Technical Information:</h3>
            <div class="tech-field"><strong>Session Identifier:</strong> <span class="session-id">${sessionIdentifier}</span></div>
            <div class="tech-field"><strong>Payment ID:</strong> ${paymentId}</div>
            <div class="tech-field"><strong>Database Record ID:</strong> ${formData?.id || "Unknown"}</div>
            <div class="tech-field"><strong>Payment Status:</strong> ${formData?.payment_status || "Unknown"}</div>
            <div class="tech-field"><strong>Created At:</strong> ${formData?.created_at ? new Date(formData.created_at).toLocaleString() : "Unknown"}</div>
          </div>
          
          <div class="form-details">
            <h3>📝 Form Submission Details:</h3>
            
            <div class="form-field">
              <strong>Limiting Beliefs:</strong>
              <div class="form-field-content">${limitingBeliefs}</div>
            </div>
            
            <div class="form-field">
              <strong>Conscious Struggles:</strong>
              <div class="form-field-content">${consciousStruggles}</div>
            </div>
            
            <div class="form-field">
              <strong>Specific Objective:</strong>
              <div class="form-field-content">${specificObjective}</div>
            </div>
            
            <div class="form-field">
              <strong>Meditation Style:</strong>
              <div class="form-field-content">${meditationStyle}</div>
            </div>
            
            <div class="form-field">
              <strong>Voice Gender:</strong>
              <div class="form-field-content">${voiceGender}</div>
            </div>
            
            <div class="form-field">
              <strong>Voice Tonality:</strong>
              <div class="form-field-content">${voiceTonality}</div>
            </div>
            
            <div class="form-field">
              <strong>Dream Life Visualization:</strong>
              <div class="form-field-content">${dreamLifeVisualization}</div>
            </div>
            
            <div class="form-field">
              <strong>Additional Information:</strong>
              <div class="form-field-content">${additionalInfo}</div>
            </div>
            
            <div class="form-field">
              <strong>Custom Voice Sample:</strong>
              <div class="form-field-content">
                ${customVoiceUrl !== "No custom voice uploaded" ? `<a href="${customVoiceUrl}" target="_blank">Download Voice Sample</a>` : customVoiceUrl}
              </div>
            </div>
          </div>
          
          <p><strong>⚡ Action Required:</strong> Please begin creating the custom meditation package for this customer. They have been informed that they will receive their package within 48 hours.</p>
          
        </div>
        <div class="footer">
          <p>This is an automated notification from the ManifestVault system.</p>
          <p>&copy; ${new Date().getFullYear()} ManifestVault. All rights reserved.</p>
          <p>Session ID: <span class="session-id">${sessionIdentifier}</span></p>
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, text, html }
}
