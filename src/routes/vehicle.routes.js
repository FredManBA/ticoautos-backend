const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const {
  getVehicleQuestionHistory,
} = require("../controllers/question.controller");
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
router.get("/", listVehicles);
router.get("/:id/questions", authenticate, getVehicleQuestionHistory);
router.get("/:id", getVehicleById);
router.post("/", authenticate, createVehicle);
router.patch("/:id", authenticate, updateVehicle);
router.patch("/:id/sold", authenticate, markVehicleAsSold);
router.delete("/:id", authenticate, deleteVehicle);

module.exports = router;
