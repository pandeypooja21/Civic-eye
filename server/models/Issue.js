const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pothole', 'streetlight', 'graffiti', 'trash', 'sidewalk', 'water', 'traffic-signal', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open'
  },
  imageUrl: {
    type: String
  },
  reportedBy: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
IssueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Issue', IssueSchema);
