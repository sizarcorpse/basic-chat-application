const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 4,
      max: 255,
    },
    email: {
      type: String,
      require: true,
      min: 8,
      max: 30,
    },
    password: {
      type: String,
      require: true,
      max: 2000,
      min: 8,
    },
    profilePhoto: {
      type: Buffer,
    },
    socketID: [
      {
        type: String,
      },
    ],
    rooms: {
      type: String,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
