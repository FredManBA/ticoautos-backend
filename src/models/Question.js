const mongoose = require("mongoose");

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle is required"],
      immutable: true,
      index: true,
    },
    askedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Question author is required"],
      immutable: true,
      index: true,
    },
    message: {
      type: String,
      required: [true, "Question message is required"],
      trim: true,
      minlength: [5, "Question message must be at least 5 characters long"],
      maxlength: [1000, "Question message must not exceed 1000 characters"],
      immutable: true,
    },
    askedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "answered"],
        message: "Question status must be pending or answered",
      },
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

questionSchema.index({ vehicle: 1, askedAt: -1 });
questionSchema.index({ askedBy: 1, askedAt: -1 });

module.exports = mongoose.model("Question", questionSchema);
