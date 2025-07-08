const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { produceIssueEvent } = require('../fluvio');
const { sendIssueConfirmationEmail, sendStatusUpdateEmail } = require('../services/emailService');
const dotenv = require('dotenv');

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get filtered issues
router.get('/filter', async (req, res) => {
  try {
    const { status, type, timeframe } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      let cutoffDate;

      switch (timeframe) {
        case 'day':
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      query.createdAt = { $gte: cutoffDate };
    }

    const issues = await Issue.find(query).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new issue
router.post('/', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    const savedIssue = await issue.save();

    // Send to Fluvio if enabled
    if (process.env.FLUVIO_ENABLED === 'true') {
      try {
        await produceIssueEvent('issue-created', savedIssue);
      } catch (fluvioError) {
        console.error('Failed to produce Fluvio event:', fluvioError);
        // Continue even if Fluvio fails
      }
    }

    // Send confirmation email if email is provided
    if (process.env.EMAIL_ENABLED === 'true' && req.body.reportedBy) {
      try {
        const emailResult = await sendIssueConfirmationEmail(savedIssue, req.body.reportedBy);
        console.log(`Confirmation email sent to ${req.body.reportedBy}`);

        // Add email info to the response
        savedIssue._doc.emailSent = true;
        savedIssue._doc.emailInfo = {
          to: req.body.reportedBy,
          messageId: emailResult.messageId || 'mock-id',
          sentAt: new Date().toISOString()
        };
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue even if email fails
        savedIssue._doc.emailSent = false;
        savedIssue._doc.emailError = emailError.message;
      }
    } else {
      savedIssue._doc.emailSent = false;
      savedIssue._doc.emailInfo = { reason: 'Email not enabled or no email provided' };
    }

    res.status(201).json(savedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an issue
router.patch('/:id', async (req, res) => {
  try {
    // Get the original issue to check for status changes
    const originalIssue = await Issue.findById(req.params.id);
    if (!originalIssue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    // Send to Fluvio if enabled
    if (process.env.FLUVIO_ENABLED === 'true') {
      try {
        await produceIssueEvent('issue-updated', updatedIssue);
      } catch (fluvioError) {
        console.error('Failed to produce Fluvio event:', fluvioError);
        // Continue even if Fluvio fails
      }
    }

    // Send status update email if status has changed and email is enabled
    if (process.env.EMAIL_ENABLED === 'true' &&
        originalIssue.status !== updatedIssue.status &&
        updatedIssue.reportedBy) {
      try {
        const emailResult = await sendStatusUpdateEmail(updatedIssue, updatedIssue.reportedBy);
        console.log(`Status update email sent to ${updatedIssue.reportedBy}`);

        // Add email info to the response
        updatedIssue._doc.emailSent = true;
        updatedIssue._doc.emailInfo = {
          to: updatedIssue.reportedBy,
          messageId: emailResult.messageId || 'mock-id',
          sentAt: new Date().toISOString(),
          statusChange: `${originalIssue.status} → ${updatedIssue.status}`
        };
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Continue even if email fails
        updatedIssue._doc.emailSent = false;
        updatedIssue._doc.emailError = emailError.message;
      }
    } else {
      updatedIssue._doc.emailSent = false;
      updatedIssue._doc.emailInfo = {
        reason: originalIssue.status === updatedIssue.status ?
          'Status did not change' : 'Email not enabled or no email provided'
      };
    }

    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an issue
router.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Send to Fluvio if enabled
    if (process.env.FLUVIO_ENABLED === 'true') {
      try {
        await produceIssueEvent('issue-deleted', { id: req.params.id });
      } catch (fluvioError) {
        console.error('Failed to produce Fluvio event:', fluvioError);
        // Continue even if Fluvio fails
      }
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
