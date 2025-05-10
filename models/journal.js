const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    immutable: true // Destination cannot be changed once created
  },
  arrivalDate: {
    type: Date,
    required: [true, 'Arrival date is required']
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required'],
    validate: {
      validator: function(value) {
        return value > this.arrivalDate;
      },
      message: 'Departure date must be after arrival date'
    }
  },
  experience: {
    type: String,
    required: [true, 'Experience details are required'],
    minlength: [10, 'Experience must be at least 10 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Journal = mongoose.model('Journal', JournalSchema);
module.exports = Journal;