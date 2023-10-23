const mongoose = require("mongoose")

const WattSwapSignupSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const WattSwapSignupModel = mongoose.model("users", WattSwapSignupSchema)
module.exports = WattSwapSignupModel