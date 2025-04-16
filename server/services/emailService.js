const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create a transporter using environment variables
// Create a transporter using environment variables or ethereal for testing
let transporter;

// Check if we have real email credentials
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  console.log('Email service configured with real credentials');
} else {
  // For hackathon/testing, use ethereal.email (fake SMTP service)
  console.log('No email credentials found, using ethereal.email for testing');

  // Create a test account on first use
  nodemailer.createTestAccount().then(testAccount => {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Ethereal email test account created');
  }).catch(err => {
    console.error('Failed to create test email account:', err);
    // Fallback to a mock transporter
    transporter = {
      sendMail: async (options) => {
        console.log('MOCK EMAIL SENT:', options);
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  });
}

/**
 * Send a confirmation email to the user who reported an issue
 * @param {Object} issue - The issue object
 * @param {string} recipientEmail - The email address of the recipient
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendIssueConfirmationEmail = async (issue, recipientEmail) => {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.log('Invalid email address, skipping confirmation email');
    return;
  }

  // Wait for transporter to be initialized if using ethereal
  if (!transporter) {
    console.log('Email transporter not ready yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!transporter) {
      console.log('Email transporter still not ready, using mock');
      console.log('MOCK EMAIL WOULD BE SENT TO:', recipientEmail);
      return { messageId: 'mock-id-' + Date.now() };
    }
  }

  const issueTypeMap = {
    'pothole': 'Pothole',
    'streetlight': 'Street Light Issue',
    'graffiti': 'Graffiti',
    'trash': 'Trash/Debris',
    'sidewalk': 'Sidewalk Damage',
    'water': 'Water Issue',
    'traffic-signal': 'Traffic Signal Problem',
    'other': 'Other Issue'
  };

  const issueType = issueTypeMap[issue.type] || 'Issue';
  const issueLocation = issue.location.address || `Lat: ${issue.location.lat}, Lng: ${issue.location.lng}`;

  const mailOptions = {
    from: `"Civic Eye Reporting" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `Your ${issueType} Report Has Been Received - Ref #${issue._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #6a0dad; padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Civic Eye Reporting</h1>
        </div>

        <div style="padding: 20px;">
          <p>Thank you for reporting an issue in your community. Your contribution helps make our city better for everyone.</p>

          <h2 style="color: #6a0dad; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Report Details</h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Reference Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issue._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Issue Type:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issueType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Location:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issueLocation}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Description:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issue.description}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Status:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issue.status.toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Reported On:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(issue.createdAt).toLocaleString()}</td>
            </tr>
          </table>

          <p>You can check the status of your report by visiting our website and referencing your report number.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>

        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Civic Eye Reporting. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${recipientEmail}: ${info.messageId}`);

    // If using Ethereal, provide a preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw the error, just log it and continue
    return { messageId: 'error-' + Date.now(), error };
  }
};

/**
 * Send a status update email to the user when their reported issue status changes
 * @param {Object} issue - The updated issue object
 * @param {string} recipientEmail - The email address of the recipient
 * @returns {Promise} - Promise that resolves when email is sent
 */
const sendStatusUpdateEmail = async (issue, recipientEmail) => {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.log('Invalid email address, skipping status update email');
    return;
  }

  // Wait for transporter to be initialized if using ethereal
  if (!transporter) {
    console.log('Email transporter not ready yet, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!transporter) {
      console.log('Email transporter still not ready, using mock');
      console.log('MOCK STATUS UPDATE EMAIL WOULD BE SENT TO:', recipientEmail);
      return { messageId: 'mock-id-' + Date.now() };
    }
  }

  const statusMap = {
    'open': 'Open',
    'in-progress': 'In Progress',
    'resolved': 'Resolved'
  };

  const issueTypeMap = {
    'pothole': 'Pothole',
    'streetlight': 'Street Light Issue',
    'graffiti': 'Graffiti',
    'trash': 'Trash/Debris',
    'sidewalk': 'Sidewalk Damage',
    'water': 'Water Issue',
    'traffic-signal': 'Traffic Signal Problem',
    'other': 'Other Issue'
  };

  const issueType = issueTypeMap[issue.type] || 'Issue';
  const statusText = statusMap[issue.status] || issue.status;

  const mailOptions = {
    from: `"Civic Eye Reporting" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `Your Report Status Updated to ${statusText} - Ref #${issue._id}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #6a0dad; padding: 15px; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Civic Eye Reporting</h1>
        </div>

        <div style="padding: 20px;">
          <p>The status of your reported issue has been updated.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="color: #6a0dad; margin-top: 0;">Status: ${statusText}</h2>
          </div>

          <h2 style="color: #6a0dad; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Report Details</h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Reference Number:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issue._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Issue Type:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issueType}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Description:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${issue.description}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; font-weight: bold;">Updated On:</td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${new Date(issue.updatedAt).toLocaleString()}</td>
            </tr>
          </table>

          <p>Thank you for helping improve our community.</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>

        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 0 0 5px 5px; text-align: center; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Civic Eye Reporting. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${recipientEmail}: ${info.messageId}`);

    // If using Ethereal, provide a preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending status update email:', error);
    // Don't throw the error, just log it and continue
    return { messageId: 'error-' + Date.now(), error };
  }
};

module.exports = {
  sendIssueConfirmationEmail,
  sendStatusUpdateEmail
};
