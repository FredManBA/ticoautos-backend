const mongoose = require("mongoose");

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"],
      unique: true,
      immutable: true,
      index: true,
    },
    answeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Answer author is required"],
      immutable: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Answer message is required"],
      trim: true,
      minlength: [5, "Answer message must be at least 5 characters long"],
      maxlength: [1000, "Answer message must not exceed 1000 characters"],
      immutable: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

answerSchema.index({ answeredBy: 1, answeredAt: -1 });

module.exports = mongoose.model("Answer", answerSchema);
