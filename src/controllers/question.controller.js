const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Vehicle = require("../models/Vehicle");
const { sendSuccess, createError, asyncHandler } = require("../utils/apiResponse");

const QUESTION_POPULATE = [
  { path: "askedBy", select: "_id name" },
  {
    path: "vehicle",
    select: "_id brand model status owner",
    populate: {
      path: "owner",
      select: "_id name",
    },
  },
];

const attachAnswersToQuestions = async (questions) => {
  if (questions.length === 0) {
    return [];
  }

  const questionIds = questions.map((question) => question._id);
  const answers = await Answer.find({
    question: { $in: questionIds },
  })
    .populate("answeredBy", "_id name")
    .sort({ answeredAt: 1 })
    .lean();

  const answersByQuestionId = new Map(
    answers.map((answer) => [answer.question.toString(), answer])
  );

  return questions.map((question) => ({
    ...question,
    answer: answersByQuestionId.get(question._id.toString()) || null,
  }));
};

const findQuestionsWithAnswers = async ({ filter, sort }) => {
  const questions = await Question.find(filter)
    .populate(QUESTION_POPULATE)
    .sort(sort)
    .lean();

  return attachAnswersToQuestions(questions);
};

const createQuestion = asyncHandler(async (req, res) => {
  const { vehicleId, message } = req.body;

  const vehicle = await Vehicle.findById(vehicleId).populate("owner", "_id name");

  if (!vehicle) {
    throw createError(404, "Vehicle not found", [
      {
        field: "vehicleId",
        message: "Vehicle was not found",
      },
    ]);
  }

  if (vehicle.owner._id.equals(req.user._id)) {
    throw createError(403, "You cannot ask about your own vehicle", [
      {
        field: "vehicleId",
        message: "Own vehicles cannot receive self-questions",
      },
    ]);
  }

  const question = await Question.create({
    vehicle: vehicle._id,
    askedBy: req.user._id,
    message,
    status: "pending",
  });

  await question.populate(QUESTION_POPULATE);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Question created successfully",
    data: {
      question,
    },
  });
});

const listMyQuestions = asyncHandler(async (req, res) => {
  const items = await findQuestionsWithAnswers({
    filter: { askedBy: req.user._id },
    sort: { askedAt: -1 },
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "User questions retrieved successfully",
    data: {
      items,
    },
  });
});

const listReceivedQuestions = asyncHandler(async (req, res) => {
  const ownedVehicles = await Vehicle.find(
    { owner: req.user._id },
    { _id: 1 }
  ).lean();

  if (ownedVehicles.length === 0) {
    return sendSuccess(res, {
      statusCode: 200,
      message: "Received questions retrieved successfully",
      data: {
        items: [],
      },
    });
  }

  const items = await findQuestionsWithAnswers({
    filter: {
      vehicle: {
        $in: ownedVehicles.map((vehicle) => vehicle._id),
      },
    },
    sort: { askedAt: -1 },
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Received questions retrieved successfully",
    data: {
      items,
    },
  });
});

const getVehicleQuestionHistory = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("owner", "_id name");

  if (!vehicle) {
    throw createError(404, "Vehicle not found", [
      {
        field: "id",
        message: "Vehicle was not found",
      },
    ]);
  }

  if (!vehicle.owner._id.equals(req.user._id)) {
    throw createError(403, "You are not allowed to view this vehicle history", [
      {
        field: "authorization",
        message: "Only the vehicle owner can view this history",
      },
    ]);
  }

  const items = await findQuestionsWithAnswers({
    filter: { vehicle: vehicle._id },
    sort: { askedAt: 1 },
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: "Vehicle question history retrieved successfully",
    data: {
      vehicle,
      items,
    },
  });
});

const answerQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const question = await Question.findById(id).populate([
    {
      path: "vehicle",
      select: "_id brand model owner status",
      populate: {
        path: "owner",
        select: "_id name",
      },
    },
    {
      path: "askedBy",
      select: "_id name",
    },
  ]);

  if (!question) {
    throw createError(404, "Question not found", [
      {
        field: "id",
        message: "Question was not found",
      },
    ]);
  }

  if (!question.vehicle) {
    throw createError(404, "Vehicle not found", [
      {
        field: "question",
        message: "Associated vehicle was not found",
      },
    ]);
  }

  if (!question.vehicle.owner._id.equals(req.user._id)) {
    throw createError(403, "You are not allowed to answer this question", [
      {
        field: "authorization",
        message: "Only the vehicle owner can answer this question",
      },
    ]);
  }

  const existingAnswer = await Answer.findOne({ question: question._id });

  if (existingAnswer) {
    throw createError(409, "Question has already been answered", [
      {
        field: "question",
        message: "Only one answer is allowed per question",
      },
    ]);
  }

  const answer = await Answer.create({
    question: question._id,
    answeredBy: req.user._id,
    message,
  });

  question.status = "answered";
  await question.save();

  await answer.populate([
    {
      path: "answeredBy",
      select: "_id name",
    },
    {
      path: "question",
      select: "_id message askedAt status vehicle askedBy",
      populate: [
        {
          path: "askedBy",
          select: "_id name",
        },
        {
          path: "vehicle",
          select: "_id brand model owner",
          populate: {
            path: "owner",
            select: "_id name",
          },
        },
      ],
    },
  ]);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Answer created successfully",
    data: {
      answer,
    },
  });
});

module.exports = {
  createQuestion,
  listMyQuestions,
  listReceivedQuestions,
  getVehicleQuestionHistory,
  answerQuestion,
};
