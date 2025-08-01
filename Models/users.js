const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const dotenv = require('dotenv');
dotenv.config();
const db = process.env.MONGO_URI;
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(db);


// mongoose.connect("mongodb://127.0.0.1:27017/studentResources");


const usersSchema = mongoose.Schema({
  googleId: String,
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  username: {
    type: String,
  },
  Password: {
    type: String,
  },
  Department: {
    type: String,
  },
  picture: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  uploads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
  ],
  savedResources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
    },
  ],
});
module.exports = mongoose.model("user", usersSchema);
