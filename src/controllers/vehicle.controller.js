const mongoose = require("mongoose");

const Vehicle = require("../models/Vehicle");
const buildVehicleFilters = require("../utils/buildVehicleFilters");

const EDITABLE_FIELDS = [
  "brand",
  "model",
  "year",
  "price",
  "description",
  "mileage",
  "color",
  "transmission",
  "fuelType",
  "location",
  "images",
];

const mapValidationErrors = (error) => {
  if (error?.name !== "ValidationError") {
    return [];
  }

  return Object.values(error.errors).map((validationError) => ({
    field: validationError.path,
    message: validationError.message,
  }));
};

const pickEditableFields = (payload = {}) =>
  EDITABLE_FIELDS.reduce((accumulator, field) => {
    if (payload[field] !== undefined) {
      accumulator[field] = payload[field];
    }

    return accumulator;
  }, {});

const isInvalidObjectId = (id) => !mongoose.isValidObjectId(id);

const isVehicleOwner = (vehicle, userId) => vehicle.owner.equals(userId);

const listVehicles = async (req, res) => {
  const { filters, pagination, errors } = buildVehicleFilters(req.query);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle filters",
      errors,
    });
  }

  try {
    const [vehicles, totalItems] = await Promise.all([
      Vehicle.find(filters)
        .populate("owner", "_id name")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Vehicle.countDocuments(filters),
    ]);

    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / pagination.limit);

    return res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: {
        items: vehicles,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalItems,
          totalPages,
          hasNextPage: pagination.page < totalPages,
          hasPreviousPage: pagination.page > 1 && totalPages > 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

const getVehicleById = async (req, res) => {
  const { id } = req.params;

  if (isInvalidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle id",
      errors: [{ field: "id", message: "Vehicle id is invalid" }],
    });
  }

  try {
    const vehicle = await Vehicle.findById(id).populate("owner", "_id name");

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: [{ field: "id", message: "Vehicle was not found" }],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

const listMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "User vehicles retrieved successfully",
      data: {
        items: vehicles,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

const createVehicle = async (req, res) => {
  try {
    const payload = pickEditableFields(req.body);

    const vehicle = await Vehicle.create({
      ...payload,
      owner: req.user._id,
      status: "available",
    });

    await vehicle.populate("owner", "_id name");

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: {
        vehicle,
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

const updateVehicle = async (req, res) => {
  const { id } = req.params;

  if (isInvalidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle id",
      errors: [{ field: "id", message: "Vehicle id is invalid" }],
    });
  }

  const payload = pickEditableFields(req.body);

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid vehicle fields were provided",
      errors: [
        {
          field: "body",
          message: "At least one editable vehicle field is required",
        },
      ],
    });
  }

  try {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: [{ field: "id", message: "Vehicle was not found" }],
      });
    }

    if (!isVehicleOwner(vehicle, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this vehicle",
        errors: [
          {
            field: "authorization",
            message: "Only the owner can update this vehicle",
          },
        ],
      });
    }

    Object.assign(vehicle, payload);
    await vehicle.save();
    await vehicle.populate("owner", "_id name");

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: {
        vehicle,
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

const markVehicleAsSold = async (req, res) => {
  const { id } = req.params;

  if (isInvalidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle id",
      errors: [{ field: "id", message: "Vehicle id is invalid" }],
    });
  }

  try {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: [{ field: "id", message: "Vehicle was not found" }],
      });
    }

    if (!isVehicleOwner(vehicle, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify this vehicle",
        errors: [
          {
            field: "authorization",
            message: "Only the owner can mark this vehicle as sold",
          },
        ],
      });
    }

    if (vehicle.status === "sold") {
      await vehicle.populate("owner", "_id name");

      return res.status(200).json({
        success: true,
        message: "Vehicle is already marked as sold",
        data: {
          vehicle,
        },
      });
    }

    vehicle.status = "sold";
    await vehicle.save();
    await vehicle.populate("owner", "_id name");

    return res.status(200).json({
      success: true,
      message: "Vehicle marked as sold successfully",
      data: {
        vehicle,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  if (isInvalidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid vehicle id",
      errors: [{ field: "id", message: "Vehicle id is invalid" }],
    });
  }

  try {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        errors: [{ field: "id", message: "Vehicle was not found" }],
      });
    }

    if (!isVehicleOwner(vehicle, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this vehicle",
        errors: [
          {
            field: "authorization",
            message: "Only the owner can delete this vehicle",
          },
        ],
      });
    }

    await vehicle.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: {
        vehicle: {
          _id: id,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

module.exports = {
  listVehicles,
  getVehicleById,
  listMyVehicles,
  createVehicle,
  updateVehicle,
  markVehicleAsSold,
  deleteVehicle,
};
