const mongoose = require('mongoose');

const chronicConditionSchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  diagnosedDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Controlled', 'Worsening', 'Improving', 'Monitoring'],
    default: 'Monitoring'
  },
  treatingProvider: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChronicCondition', chronicConditionSchema);