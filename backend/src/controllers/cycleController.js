const Cycle = require('../models/Cycle');

const logPeriod = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      flow,
      symptoms,
    } = req.body;

    if (!startDate) {
      return res.status(400).json({
        message: 'Start date is required',
      });
    }

    const cycle = await Cycle.create({
      user: req.user._id,
      startDate,
      endDate,
      flow,
      symptoms: symptoms || [],
    });

    res.status(201).json({
      cycle,
    });
  } catch (error) {
    console.error('Log period error:', error);

    res.status(500).json({
      message: 'Server error while logging period',
    });
  }
};

const getCycles = async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit) || 20,
      100
    );

    const query = {
      user: req.user._id,
    };

    if (req.query.before) {
      query.startDate = {
        $lt: new Date(req.query.before),
      };
    }

    const cycles = await Cycle.find(query)
      .sort({ startDate: -1 })
      .limit(limit);

    res.status(200).json({
      cycles,
    });
  } catch (error) {
    console.error('Get cycles error:', error);

    res.status(500).json({
      message: 'Server error while fetching cycles',
    });
  }
};

const updateCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!cycle) {
      return res.status(404).json({
        message: 'Cycle not found',
      });
    }

    const {
      startDate,
      endDate,
      flow,
      symptoms,
    } = req.body;

    if (startDate !== undefined) {
      cycle.startDate = startDate;
    }

    if (endDate !== undefined) {
      cycle.endDate = endDate;
    }

    if (flow !== undefined) {
      cycle.flow = flow;
    }

    if (symptoms !== undefined) {
      cycle.symptoms = symptoms;
    }

    await cycle.save();

    res.status(200).json({
      cycle,
    });
  } catch (error) {
    console.error('Update cycle error:', error);

    res.status(500).json({
      message: 'Server error while updating cycle',
    });
  }
};

const getCycleSummary = async (req, res) => {
  try {
    const cycles = await Cycle.find({
      user: req.user._id,
    }).sort({ startDate: -1 });

    if (cycles.length === 0) {
      return res.status(200).json({
        currentCycleDay: null,
        predictedNextPeriod: null,
        avgCycleLength: null,
        avgPeriodLength: null,
      });
    }

    // Calculate cycle lengths from consecutive period start dates
    const cycleLengths = [];

    for (let i = 0; i < cycles.length - 1; i++) {
      const currentStart = new Date(cycles[i].startDate);
      const previousStart = new Date(cycles[i + 1].startDate);

      const difference =
        (currentStart - previousStart) /
        (1000 * 60 * 60 * 24);

      if (difference > 0) {
        cycleLengths.push(difference);
      }
    }

    // Calculate period lengths
    const periodLengths = cycles
      .filter((cycle) => cycle.startDate && cycle.endDate)
      .map((cycle) => {
        const start = new Date(cycle.startDate);
        const end = new Date(cycle.endDate);

        return (
          (end - start) /
          (1000 * 60 * 60 * 24)
        ) + 1;
      })
      .filter((length) => length > 0);

    const avgCycleLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((a, b) => a + b, 0) /
            cycleLengths.length
          )
        : null;

    const avgPeriodLength =
      periodLengths.length > 0
        ? Math.round(
            periodLengths.reduce((a, b) => a + b, 0) /
            periodLengths.length
          )
        : null;

    // Most recent cycle
    const latestCycle = cycles[0];
    const latestStart = new Date(latestCycle.startDate);

    const today = new Date();

    const currentCycleDay =
      Math.floor(
        (today - latestStart) /
        (1000 * 60 * 60 * 24)
      ) + 1;

    // Predict next period
    let predictedNextPeriod = null;

    if (avgCycleLength) {
      const nextPeriod = new Date(latestStart);

      nextPeriod.setDate(
        nextPeriod.getDate() + avgCycleLength
      );

      predictedNextPeriod =
        nextPeriod.toISOString().split('T')[0];
    }

    res.status(200).json({
      currentCycleDay,
      predictedNextPeriod,
      avgCycleLength,
      avgPeriodLength,
    });
  } catch (error) {
    console.error('Cycle summary error:', error);

    res.status(500).json({
      message: 'Server error while calculating cycle summary',
    });
  }
};

module.exports = {
  logPeriod,
  getCycles,
  updateCycle,
  getCycleSummary,
};