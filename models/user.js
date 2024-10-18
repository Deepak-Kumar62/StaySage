const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
})

// Username, password and salting is added automatically by passport-local-mongoose and add some useful method to our user model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);