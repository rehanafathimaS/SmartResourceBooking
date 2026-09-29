const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resource", resourceSchema);