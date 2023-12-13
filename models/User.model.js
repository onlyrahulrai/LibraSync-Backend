const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  username: {
    type: String,
    required: [true, "Please provide unique username"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide a unique email"],
    unique: true,
  },
  mobile: { type: String },
  address: {
    type: String,
  },
  profile: {
    type: String,
  },
  bio:{
    type:String
  },
  online:{
    type:Boolean,
    default:false
  }
},{
  timestamps:true
});

module.exports = mongoose.model("User", UserSchema);
