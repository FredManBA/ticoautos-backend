const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const { createQuestion } = require("../controllers/question.controller");

const router = express.Router();

router.post("/", authenticate, createQuestion);

module.exports = router;
