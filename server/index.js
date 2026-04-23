const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const appRoutes = require("./routes/approutes");
const blockchainRoutes = require("./routes/blockchainRoutes");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const path = require("path");
const { initializeFirebase } = require('./firebaseInit');

dotenv.config();


const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect("mongodb://127.0.0.1:27017/wattswap", {  useNewUrlParser: true,
useUnifiedTopology: true,})

// Initialize Firebase for simulator/hardware integration
initializeFirebase().catch(err => {
  console.warn('⚠️  Firebase initialization failed - simulator will not work:', err.message);
  console.warn('   To use simulator, configure FIREBASE_DATABASE_URL and FIREBASE_SERVICE_ACCOUNT_KEY_PATH');
});

//controller functions
const { signupUser, loginUser } = require('./controllers/userController')

//signup route
app.post('/register', signupUser)


//login route
app.post('/login', loginUser)


//app routes
app.use('/app', appRoutes)

// Blockchain integration routes
app.use('/api', blockchainRoutes)

app.listen(4000, () => {
    console.log("server is running on 4000!")
})