const mongoose = require('mongoose');

const imagingReportSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  orderedBy: {
    type: String,
    required: true
  },
  facility: {
    type: String,
    required: true
  },
  findings: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  report: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ImagingReport', imagingReportSchema);