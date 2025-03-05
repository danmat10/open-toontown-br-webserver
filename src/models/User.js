const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { format } = require('date-fns');


const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ESTATE_ID: { type: Number, default: 0 },
  ACCOUNT_AV_SET_DEL: { type: String, default: "[0, 0, 0, 0, 0, 0]" },
  CREATED: { type: String, default: "" },
  LAST_LOGIN: { type: String, default: "" },
  ACCESS_LEVEL: { type: String, default: '"SYSTEM_ADMIN"' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastUser = await this.constructor.findOne({}, {}, { sort: { id: -1 } }); 
    this.id = lastUser ? lastUser.id + 1 : 100000000;
  }
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.CREATED = format(new Date(), 'EEE MMM dd HH:mm:ss yyyy');
  next();
});

module.exports = mongoose.model('User', userSchema);