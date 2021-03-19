const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const AdminSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
module.exports = Admin = mongoose.model("admins", AdminSchema);
