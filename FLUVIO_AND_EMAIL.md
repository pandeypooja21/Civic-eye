# Fluvio and Email Features in Civic Eye Reporting

This guide explains how to use the Fluvio real-time streaming and email notification features in the Civic Eye Reporting application.

## Fluvio Real-Time Updates

The application uses a custom Fluvio implementation to provide real-time updates to all connected clients. When an issue is created, updated, or deleted, all connected clients receive the update immediately.

### How It Works

1. The server uses an event-based system to simulate Fluvio functionality
2. WebSockets establish a persistent connection between the client and server
3. When an issue is created or updated, the server broadcasts the event to all connected clients
4. The client-side code updates the UI in real-time when it receives these events

### Configuration

To enable Fluvio, set the following environment variables:

```
FLUVIO_ENABLED=true
FLUVIO_TOPIC=civic-eye-issues
```

### Testing Real-Time Updates

To test the real-time updates:

1. Open the application in two browser windows
2. In one window, log in and submit a new issue
3. In the other window (admin view), you'll see the issue appear immediately without refreshing
4. When an admin updates the status of an issue, the user's view will update in real-time

## Email Notifications

The application sends email notifications to users when they submit issues and when the status of their issues changes.

### How It Works

1. When a user submits an issue, they receive a confirmation email with the details
2. When an admin updates the status of an issue, the user receives a status update email
3. The application uses Nodemailer to send emails
4. For development/testing, the application can use Ethereal.email to preview emails without sending them

### Configuration

To enable email notifications, set the following environment variables:

```
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail  # or another email service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

For Gmail, you need to use an App Password:
1. Go to your Google Account > Security > 2-Step Verification > App passwords
2. Create a new app password for "Mail" and "Other (Custom name)"
3. Use the generated password as EMAIL_PASSWORD

### Testing Email Notifications

For testing without real email credentials, the application uses Ethereal.email:

1. Submit an issue with your email address
2. Check the server console for a message like: "Preview URL: https://ethereal.email/message/..."
3. Click that link to see the email that would be sent in a production environment

## Deploying to Vercel

When deploying to Vercel, make sure to set all the necessary environment variables in the Vercel dashboard:

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add all the required environment variables

For WebSockets to work properly on Vercel:
1. Set `VITE_WS_URL` to use the `wss://` protocol (secure WebSockets)
2. Be aware that Vercel's serverless functions have limitations with long-lived connections
3. The application has a fallback mechanism to use mock data if WebSockets fail

## Troubleshooting

### WebSocket Connection Issues

If you're having issues with WebSocket connections:
- Check that your `VITE_WS_URL` is using the `wss://` protocol in production
- Verify that your server is properly configured to accept WebSocket connections
- Check the browser console for any connection errors

### Email Sending Issues

If emails are not being sent:
- Verify that `EMAIL_ENABLED` is set to `true`
- Check that your email credentials are correct
- For Gmail, make sure you're using an App Password, not your regular password
- Check the server logs for any error messages related to email sending

### Fluvio Issues

If real-time updates are not working:
- Verify that `FLUVIO_ENABLED` is set to `true`
- Check the server logs for any error messages related to Fluvio
- Make sure your WebSocket connection is working properly
- Try refreshing the page to establish a new WebSocket connection
