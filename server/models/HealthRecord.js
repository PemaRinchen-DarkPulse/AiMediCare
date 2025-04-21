const mongoose = require('mongoose');

const healthRecordSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  recordType: {
    type: String,
    required: true,
    enum: ['diagnosis', 'procedure', 'visit']
  },
  date: {
    type: Date,
    required: true
  },
  diagnosis: {
    type: String,
    required: function() {
      return this.recordType === 'diagnosis';
    }
  },
  provider: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Resolved', 'Monitoring'],
    default: 'Active'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);