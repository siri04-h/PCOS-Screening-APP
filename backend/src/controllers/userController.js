const User = require('../models/User');

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);

    res.status(500).json({
      message: 'Server error while fetching profile',
    });
  }
};

const updateHealthProfile = async (req, res) => {
  try {
    const {
      age,
      heightCm,
      weightKg,
      avgCycleLength,
      avgPeriodLength,
      pcosFamilyHistory,
      knownConditions,
      symptomsChecklist,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        age,
        heightCm,
        weightKg,
        avgCycleLength,
        avgPeriodLength,
        pcosFamilyHistory,
        knownConditions,
        symptomsChecklist,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Update health profile error:', error);

    res.status(500).json({
      message: 'Server error while updating health profile',
    });
  }
};

module.exports = {
  getMe,
  updateHealthProfile,
};