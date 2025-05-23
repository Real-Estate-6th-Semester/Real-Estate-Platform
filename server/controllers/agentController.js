const agentModel = require('../models/agentModel.js');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync.js');
const appError = require('../utils/appError.js');

exports.createAgent = catchAsync(async (req, res) => {
  try {
    const newAgent = await agentModel.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        agent: newAgent,
        message: 'Successfully created agent'
      }
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Error creating agent'
    });
  }
});

exports.updateAgentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const agent = await agentModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!agent) {
    return res.status(404).json({
      status: 'fail',
      message: `No agent found with ID: ${id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      agent,
    },
  });
});

exports.deleteAgentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const deletedAgent = await agentModel.findByIdAndDelete(id);

  if (!deletedAgent) {
    return res.status(404).json({
      status: 'fail',
      message: `No agent found with ID: ${id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getAllAgents = catchAsync(async (req, res) => {
  const agents = await agentModel.find();

  res.status(200).json({
    status: 'success',
    results: agents.length,
    data: {
      agents,
    },
  });
});

exports.getAgentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const agent = await agentModel.findById(id);

  if (!agent) {
    return res.status(404).json({
      status: 'fail',
      message: `No agent found with ID: ${id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      agent,
    },
  });
});

exports.getAgentPhoneNumber = catchAsync(async (req, res) => {
  const { id } = req.params;
  const agent = await agentModel.findById(id).select('phoneNumber');

  if (!agent) {
    return res.status(404).json({
      status: 'fail',
      message: `No agent found with ID: ${id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      phoneNumber: agent.phoneNumber,
    },
  });
}); 