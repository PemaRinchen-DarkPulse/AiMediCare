const mongoose = require('mongoose');

const allergySchema = mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  allergen: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Severe'],
    required: true
  },
  reaction: {
    type: String,
    required: true
  },
  dateIdentified: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Allergy', allergySchema);