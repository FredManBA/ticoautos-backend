const mongoose = require("mongoose");

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

module.exports = {
  createQuestion,
};
