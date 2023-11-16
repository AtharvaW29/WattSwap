const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const User = require("./models/User")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/wattswap", {  useNewUrlParser: true,
useUnifiedTopology: true,})

//controller functions
const { signupUser, loginUser } = require('./controllers/userController')

//signup route
app.post('/register', signupUser)


//login route
app.post('/login', loginUser)


app.listen(4000, () => {
    console.log("server is on BABY!")
})