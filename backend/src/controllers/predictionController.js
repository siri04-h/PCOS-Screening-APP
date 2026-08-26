const Prediction = require('../models/Prediction');
const User = require('../models/User');
const { predictPCOS } = require('../services/fastapiService');

const runPcosScreening = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const payload = {
      age: user.age,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      avgCycleLength: user.avgCycleLength,
      avgPeriodLength: user.avgPeriodLength,
      pcosFamilyHistory: user.pcosFamilyHistory || false,
      knownConditions: user.knownConditions || [],
      symptomsChecklist: user.symptomsChecklist || [],
    };

    // Make sure the health profile is complete
    const requiredFields = [
      'age',
      'heightCm',
      'weightKg',
      'avgCycleLength',
      'avgPeriodLength',
    ];

    const missingField = requiredFields.find(
      (field) => payload[field] === undefined || payload[field] === null
    );

    if (missingField) {
      return res.status(400).json({
        message: 'Complete health profile is required before PCOS screening',
        missingField,
      });
    }

    // Send user data to Member 2's FastAPI service
    const result = await predictPCOS(payload);

    // Save the prediction in MongoDB
    const prediction = await Prediction.create({
      user: req.user._id,
      riskLevel: result.riskLevel,
      riskScore: result.riskScore,
      shap: result.shap || [],
      modelVersion: 'fastapi-1.0.0',
      source: 'fastapi',
    });

    res.status(201).json({
      riskLevel: prediction.riskLevel,
      riskScore: prediction.riskScore,
      shap: prediction.shap,
      predictionId: prediction._id,
    });
  } catch (error) {
    console.error(
      'PCOS screening error:',
      error.response?.data || error.message
    );

    res.status(502).json({
      message: 'PCOS prediction service unavailable',
    });
  }
};


const getLatestPcosResult = async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    if (!prediction) {
      return res.status(404).json({
        message: 'No PCOS screening result found',
      });
    }

    res.status(200).json({
      riskLevel: prediction.riskLevel,
      riskScore: prediction.riskScore,
      shap: prediction.shap,
      predictionId: prediction._id,
      modelVersion: prediction.modelVersion,
      createdAt: prediction.createdAt,
    });
  } catch (error) {
    console.error('Get latest PCOS result error:', error);

    res.status(500).json({
      message: 'Server error while fetching PCOS screening result',
    });
  }
};


const getPcosHistory = async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      100
    );

    const predictions = await Prediction.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      predictions,
    });
  } catch (error) {
    console.error('Get PCOS history error:', error);

    res.status(500).json({
      message: 'Server error while fetching PCOS history',
    });
  }
};


module.exports = {
  runPcosScreening,
  getLatestPcosResult,
  getPcosHistory,
};