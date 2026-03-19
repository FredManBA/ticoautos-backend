const Vehicle = require("../models/Vehicle");
const buildVehicleFilters = require("../utils/buildVehicleFilters");
const { sendSuccess, createError, asyncHandler } = require("../utils/apiResponse");

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

const pickEditableFields = (payload = {}) =>
  EDITABLE_FIELDS.reduce((accumulator, field) => {
    if (payload[field] !== undefined) {
      accumulator[field] = payload[field];
    }

    return accumulator;
  }, {});

const isVehicleOwner = (vehicle, userId) => vehicle.owner.equals(userId);

const listVehicles = asyncHandler(async (req, res) => {
  const { filters, pagination, errors } =
    req.vehicleListOptions || buildVehicleFilters(req.query);

  if (errors.length > 0) {
    throw createError(400, "Invalid vehicle filters", errors);
  }

  const [vehicles, totalItems] = await Promise.all([
    Vehicle.find(filters)
      .populate("owner", "_id name")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Vehicle.countDocuments(filters),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pagination.limit);

  return sendSuccess(res, {
    statusCode: 200,
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
});

const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("owner", "_id name");

  if (!vehicle) {
    throw createError(404, "Vehicle not found", [
      { field: "id", message: "Vehicle was not found" },
    ]);
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: "Vehicle retrieved successfully",
    data: {
      vehicle,
    },
  });
});

const listMyVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "User vehicles retrieved successfully",
    data: {
      items: vehicles,
    },
  });
});

const createVehicle = asyncHandler(async (req, res) => {
  const payload = pickEditableFields(req.body);

  const vehicle = await Vehicle.create({
    ...payload,
    owner: req.user._id,
    status: "available",
  });

  await vehicle.populate("owner", "_id name");

  return sendSuccess(res, {
    statusCode: 201,
    message: "Vehicle created successfully",
    data: {
      vehicle,
    },
  });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const payload = pickEditableFields(req.body);

  if (Object.keys(payload).length === 0) {
    throw createError(400, "No valid vehicle fields were provided", [
      {
        field: "body",
        message: "At least one editable vehicle field is required",
      },
    ]);
  }

  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw createError(404, "Vehicle not found", [
      { field: "id", message: "Vehicle was not found" },
    ]);
  }

  if (!isVehicleOwner(vehicle, req.user._id)) {
    throw createError(403, "You are not allowed to modify this vehicle", [
      {
        field: "authorization",
        message: "Only the owner can update this vehicle",
      },
    ]);
  }

  Object.assign(vehicle, payload);
  await vehicle.save();
  await vehicle.populate("owner", "_id name");

  return sendSuccess(res, {
    statusCode: 200,
    message: "Vehicle updated successfully",
    data: {
      vehicle,
    },
  });
});

const markVehicleAsSold = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw createError(404, "Vehicle not found", [
      { field: "id", message: "Vehicle was not found" },
    ]);
  }

  if (!isVehicleOwner(vehicle, req.user._id)) {
    throw createError(403, "You are not allowed to modify this vehicle", [
      {
        field: "authorization",
        message: "Only the owner can mark this vehicle as sold",
      },
    ]);
  }

  if (vehicle.status === "sold") {
    await vehicle.populate("owner", "_id name");

    return sendSuccess(res, {
      statusCode: 200,
      message: "Vehicle is already marked as sold",
      data: {
        vehicle,
      },
    });
  }

  vehicle.status = "sold";
  await vehicle.save();
  await vehicle.populate("owner", "_id name");

  return sendSuccess(res, {
    statusCode: 200,
    message: "Vehicle marked as sold successfully",
    data: {
      vehicle,
    },
  });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw createError(404, "Vehicle not found", [
      { field: "id", message: "Vehicle was not found" },
    ]);
  }

  if (!isVehicleOwner(vehicle, req.user._id)) {
    throw createError(403, "You are not allowed to delete this vehicle", [
      {
        field: "authorization",
        message: "Only the owner can delete this vehicle",
      },
    ]);
  }

  await vehicle.deleteOne();

  return sendSuccess(res, {
    statusCode: 200,
    message: "Vehicle deleted successfully",
    data: {
      vehicle: {
        _id: req.params.id,
      },
    },
  });
});

module.exports = {
  listVehicles,
  getVehicleById,
  listMyVehicles,
  createVehicle,
  updateVehicle,
  markVehicleAsSold,
  deleteVehicle,
};
