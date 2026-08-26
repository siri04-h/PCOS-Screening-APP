const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    age: {
      type: Number,
    },

    heightCm: {
      type: Number,
    },

    weightKg: {
      type: Number,
    },

    avgCycleLength: {
      type: Number,
    },

    avgPeriodLength: {
      type: Number,
    },

    pcosFamilyHistory: {
      type: Boolean,
      default: false,
    },

    knownConditions: {
      type: [String],
      default: [],
    },

    symptomsChecklist: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);