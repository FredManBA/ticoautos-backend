const mongoose = require("mongoose");

const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Vehicle = require("../models/Vehicle");

const mapValidationErrors = (error) => {
  if (error?.name !== "ValidationError") {
    return [];
  }

  return Object.values(error.errors).map((validationError) => ({
    field: validationError.path,
    message: validationError.message,
  }));
};

const createQuestion = async (req, res) => {
  const { vehicleId, message } = req.body;
  const errors = [];

  if (!vehicleId || !String(vehicleId).trim()) {
    errors.push({
      field: "vehicleId",
      message: "vehicleId is required",
    });
  } else if (!mongoose.isValidObjectId(vehicleId)) {
    errors.push({
      field: "vehicleId",
      message: "vehicleId is invalid",
    });
  }

  if (!message || !String(message).trim()) {
    errors.push({
      field: "message",
      message: "Question message is required",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  try {
    const vehicle = await Vehicle.findById(vehicleId).populate("owner", "_id name");

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: [
          {
            field: "vehicleId",
            message: "Vehicle was not found",
          },
        ],
      });
    }

    if (vehicle.owner._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You cannot ask about your own vehicle",
        errors: [
          {
            field: "vehicleId",
            message: "Own vehicles cannot receive self-questions",
          },
        ],
      });
    }

    const question = await Question.create({
      vehicle: vehicle._id,
      askedBy: req.user._id,
      message,
      status: "pending",
    });

    await question.populate([
      { path: "askedBy", select: "_id name" },
      {
        path: "vehicle",
        select: "_id brand model status owner",
        populate: {
          path: "owner",
          select: "_id name",
        },
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: {
        question,
      },
    });
  } catch (error) {
    const validationErrors = mapValidationErrors(error);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

const answerQuestion = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const errors = [];

  if (!id || !mongoose.isValidObjectId(id)) {
    errors.push({
      field: "id",
      message: "Question id is invalid",
    });
  }

  if (!message || !String(message).trim()) {
    errors.push({
      field: "message",
      message: "Answer message is required",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  try {
    const question = await Question.findById(id).populate([
      {
        path: "vehicle",
        select: "_id brand model owner status",
        populate: {
          path: "owner",
          select: "_id name",
        },
      },
      {
        path: "askedBy",
        select: "_id name",
      },
    ]);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
        errors: [
          {
            field: "id",
            message: "Question was not found",
          },
        ],
      });
    }

    if (!question.vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: [
          {
            field: "question",
            message: "Associated vehicle was not found",
          },
        ],
      });
    }

    if (!question.vehicle.owner._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to answer this question",
        errors: [
          {
            field: "authorization",
            message: "Only the vehicle owner can answer this question",
          },
        ],
      });
    }

    const existingAnswer = await Answer.findOne({ question: question._id });

    if (existingAnswer) {
      return res.status(409).json({
        success: false,
        message: "Question has already been answered",
        errors: [
          {
            field: "question",
            message: "Only one answer is allowed per question",
          },
        ],
      });
    }

    const answer = await Answer.create({
      question: question._id,
      answeredBy: req.user._id,
      message,
    });

    question.status = "answered";
    await question.save();

    await answer.populate([
      {
        path: "answeredBy",
        select: "_id name",
      },
      {
        path: "question",
        select: "_id message askedAt status vehicle askedBy",
        populate: [
          {
            path: "askedBy",
            select: "_id name",
          },
          {
            path: "vehicle",
            select: "_id brand model owner",
            populate: {
              path: "owner",
              select: "_id name",
            },
          },
        ],
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Answer created successfully",
      data: {
        answer,
      },
    });
  } catch (error) {
    const validationErrors = mapValidationErrors(error);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Question has already been answered",
        errors: [
          {
            field: "question",
            message: "Only one answer is allowed per question",
          },
        ],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

module.exports = {
  createQuestion,
  answerQuestion,
};
