const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const appRoutes = require("./routes/approutes");
const bodyParser = require("body-parser");
const  dotenv = require('dotenv');
const path = require("path");
dotenv.config();


const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect("mongodb://127.0.0.1:27017/wattswap", {  useNewUrlParser: true,
useUnifiedTopology: true,})

//controller functions
const { signupUser, loginUser } = require('./controllers/userController')

//signup route
app.post('/register', signupUser)


//login route
app.post('/login', loginUser)


//app routes
app.use('/app', appRoutes)

app.listen(4000, () => {
    console.log("server is running on 4000!")
})