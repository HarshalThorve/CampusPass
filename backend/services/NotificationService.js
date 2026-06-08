const nodemailer = require('nodemailer');
require('dotenv').config();

class NotificationService {
  static getTransporter() {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    
    if (!hasSmtpConfig) {
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '5888'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  static async sendMail({ to, subject, html, text }) {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || 'CampusPass <noreply@campuspass.com>';

    if (!transporter) {
      console.log('========================================================================');
      console.log(`[Notification MOCK] Email Sent!`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body (Plain): ${text || 'HTML Email Sent'}`);
      console.log('========================================================================');
      return { mock: true, messageId: `mock_${Date.now()}` };
    }

    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });
      console.log(`Email successfully sent: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error('Error sending email via Nodemailer:', err.message);
      // Fallback instead of crashing
      return { error: true, message: err.message };
    }
  }

  static async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to CampusPass!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Thank you for registering on CampusPass. Your account is active under the email <strong>${user.email}</strong>.</p>
        <p>You can now browse upcoming events, buy tickets, and access your event dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In Now</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eaeaea;" />
        <p style="font-size: 12px; color: #888; text-align: center;">CampusPass Event Ticketing Platform</p>
      </div>
    `;

    return this.sendMail({
      to: user.email,
      subject: 'Welcome to CampusPass!',
      text: `Welcome to CampusPass, ${user.name}! Your account is ready.`,
      html
    });
  }

  static async sendTicketEmail(user, event, ticket) {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <div style="background-color: #6366f1; color: white; padding: 15px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h2 style="margin: 0;">Your Event Ticket is Ready!</h2>
          <p style="margin: 5px 0 0 0;">Ticket ID: ${ticket.ticket_number}</p>
        </div>
        <div style="padding: 20px;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Your registration for <strong>${event.title}</strong> is confirmed!</p>
          <div style="background-color: #f9fafb; border: 1px dashed #d1d5db; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827;">${event.title}</h3>
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Category:</strong> ${event.category.toUpperCase()}</p>
            <p style="margin-bottom: 0;"><strong>Ticket Price:</strong> ${event.price === 0 || event.price === '0.00' ? 'FREE' : `₹${event.price}`}</p>
          </div>
          <p>Please present the QR code below or your Ticket Number at the venue for check-in.</p>
          <div style="text-align: center; margin: 25px 0;">
            <p style="font-size: 14px; font-weight: bold; color: #4b5563;">Scan QR Code at the Entrance</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.ticket_number)}" alt="Ticket QR Code" style="border: 1px solid #eaeaea; padding: 10px; border-radius: 8px;" />
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/${ticket.id}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View Digital Ticket</a>
          </div>
        </div>
        <hr style="border: 0; border-top: 1px solid #eaeaea;" />
        <p style="font-size: 12px; color: #888; text-align: center;">Bring a mobile copy or print this ticket for event entry.</p>
      </div>
    `;

    return this.sendMail({
      to: user.email,
      subject: `Ticket Confirmed: ${event.title}`,
      text: `Your ticket for ${event.title} is confirmed. Ticket Number: ${ticket.ticket_number}`,
      html
    });
  }

  static async sendPaymentEmail(user, event, payment) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Payment Receipt</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your payment of <strong>₹${payment.amount}</strong> for the event <strong>${event.title}</strong> was successful.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #6b7280; padding: 5px 0;">Payment ID:</td>
              <td style="font-weight: bold; text-align: right;">${payment.razorpay_payment_id || 'MOCK_PAYMENT'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 5px 0;">Order ID:</td>
              <td style="font-weight: bold; text-align: right;">${payment.razorpay_order_id || 'MOCK_ORDER'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 5px 0;">Amount Paid:</td>
              <td style="font-weight: bold; text-align: right; color: #10b981;">₹${payment.amount}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 5px 0;">Status:</td>
              <td style="font-weight: bold; text-align: right; color: #10b981;">SUCCESSFUL</td>
            </tr>
          </table>
        </div>
        <p>A separate email with your QR entry ticket has been dispatched.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea;" />
        <p style="font-size: 12px; color: #888; text-align: center;">CampusPass Payments</p>
      </div>
    `;

    return this.sendMail({
      to: user.email,
      subject: `Payment Successful: ${event.title}`,
      text: `Thank you for your payment of ₹${payment.amount} for ${event.title}.`,
      html
    });
  }

  static async sendReminderEmail(user, event) {
    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #f59e0b; text-align: center;">Upcoming Event Reminder!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>This is a quick reminder that the event <strong>${event.title}</strong> is starting soon!</p>
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #b45309;">${event.title}</h3>
          <p><strong>Date & Time:</strong> ${formattedDate}</p>
          <p><strong>Venue:</strong> ${event.venue}</p>
        </div>
        <p>Make sure to have your QR ticket ready on your device for entry.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea;" />
        <p style="font-size: 12px; color: #888; text-align: center;">CampusPass Reminders</p>
      </div>
    `;

    return this.sendMail({
      to: user.email,
      subject: `Reminder: ${event.title} is coming up!`,
      text: `Friendly reminder that ${event.title} is starting at ${formattedDate} at ${event.venue}.`,
      html
    });
  }
}

module.exports = NotificationService;
