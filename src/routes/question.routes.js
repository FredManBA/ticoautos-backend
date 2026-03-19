const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const {
  createQuestion,
  answerQuestion,
} = require("../controllers/question.controller");

const router = express.Router();

router.post("/", authenticate, createQuestion);
router.post("/:id/answer", authenticate, answerQuestion);

module.exports = router;
