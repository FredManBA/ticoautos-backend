const express = require("express");

const authenticate = require("../middlewares/auth.middleware");
const {
  createQuestion,
  listMyQuestions,
  listReceivedQuestions,
  answerQuestion,
} = require("../controllers/question.controller");

const router = express.Router();

router.get("/mine", authenticate, listMyQuestions);
router.get("/received", authenticate, listReceivedQuestions);
router.post("/", authenticate, createQuestion);
router.post("/:id/answer", authenticate, answerQuestion);

module.exports = router;
