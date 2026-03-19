const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const {
  getVehicleQuestionHistory,
} = require("../controllers/question.controller");
const {
  validateVehicleIdParam,
  validateVehicleListQuery,
  validateCreateVehicle,
  validateUpdateVehicle,
} = require("../validators/vehicle.validator");
const {
  listVehicles,
  getVehicleById,
  listMyVehicles,
  createVehicle,
  updateVehicle,
  markVehicleAsSold,
  deleteVehicle,
} = require("../controllers/vehicle.controller");

const router = express.Router();

router.get("/mine", authenticate, listMyVehicles);
router.get("/", validateVehicleListQuery, listVehicles);
router.get("/:id/questions", authenticate, validateVehicleIdParam, getVehicleQuestionHistory);
router.get("/:id", validateVehicleIdParam, getVehicleById);
router.post("/", authenticate, validateCreateVehicle, createVehicle);
router.patch("/:id", authenticate, validateVehicleIdParam, validateUpdateVehicle, updateVehicle);
router.patch("/:id/sold", authenticate, validateVehicleIdParam, markVehicleAsSold);
router.delete("/:id", authenticate, validateVehicleIdParam, deleteVehicle);

module.exports = router;
