const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const {
  createQuestion,
  listMyQuestions,
  listReceivedQuestions,
  answerQuestion,
} = require("../controllers/question.controller");
const {
  validateCreateQuestion,
  validateAnswerQuestion,
} = require("../validators/question.validator");

const router = express.Router();

router.get("/mine", authenticate, listMyQuestions);
router.get("/received", authenticate, listReceivedQuestions);
router.post("/", authenticate, validateCreateQuestion, createQuestion);
router.post("/:id/answer", authenticate, validateAnswerQuestion, answerQuestion);

module.exports = router;
