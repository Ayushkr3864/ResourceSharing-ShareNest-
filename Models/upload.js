const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');
mongoose.set('strictQuery', false);

const uploadSchema = mongoose.Schema({
  Title: {
    type: String,
    trim: true,
    minlength: 5,
    maxlength: 20,
  },
  Description: {
    trim: true,
    type: String,
  },
  Resource_type: {
    type: String,
    default: "",
  },
  file: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  downloads: { type: Number, default: 0 },
  uploadDate: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Upload",uploadSchema)