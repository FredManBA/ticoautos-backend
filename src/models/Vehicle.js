const mongoose = require("mongoose");

const { Schema } = mongoose;

const CURRENT_YEAR = new Date().getFullYear();

const isValidImageUrl = (imageUrl) => {
  try {
    new URL(imageUrl);
    return true;
  } catch (error) {
    return false;
  }
};

const vehicleSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Vehicle owner is required"],
      index: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxlength: [60, "Brand must not exceed 60 characters"],
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
      maxlength: [60, "Model must not exceed 60 characters"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1900, "Year must be 1900 or later"],
      max: [CURRENT_YEAR + 1, "Year cannot be greater than next year"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },
    status: {
      type: String,
      enum: {
        values: ["available", "sold"],
        message: "Status must be either available or sold",
      },
      default: "available",
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },
    mileage: {
      type: Number,
      min: [0, "Mileage cannot be negative"],
      default: 0,
    },
    color: {
      type: String,
      trim: true,
      maxlength: [40, "Color must not exceed 40 characters"],
      default: null,
    },
    transmission: {
      type: String,
      enum: {
        values: ["manual", "automatic"],
        message: "Transmission must be manual or automatic",
      },
    },
    fuelType: {
      type: String,
      enum: {
        values: ["gasoline", "diesel", "hybrid", "electric"],
        message: "Fuel type is invalid",
      },
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, "Location must not exceed 120 characters"],
      default: null,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.every((image) => isValidImageUrl(image)),
        message: "All images must be valid URLs",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vehicleSchema.index({
  status: 1,
  brand: 1,
  model: 1,
  year: 1,
  price: 1,
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
