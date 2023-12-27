const mongoose = require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
  Username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  post: [{ imgURL:String, caption:String, likes:[String],userID:String, comments:[{CMTUser:String, CMT:String}]}],
});
const User = mongoose.model('User', UserSchema)
module.exports = User;