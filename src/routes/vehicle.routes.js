const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const {
  listVehicles,
  getVehicleById,
  listMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicle.controller");

const router = express.Router();

router.get("/mine", authenticate, listMyVehicles);
router.get("/", listVehicles);
router.get("/:id", getVehicleById);
router.post("/", authenticate, createVehicle);
router.patch("/:id", authenticate, updateVehicle);
router.delete("/:id", authenticate, deleteVehicle);

module.exports = router;
