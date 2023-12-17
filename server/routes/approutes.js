const express = require("express")
const router = express.Router()
const requireAuth = require("../middleware/requireAuth")
const upload = require("../middleware/uploadFile")
const { 
    getHomeData,
    getProfileData,
    createProfile,
    updateProfile
    } = require("../controllers/appController")

const {
    createListing
} = require("../controllers/transactionController")

//using auth for the following
// router.use(requireAuth)

//Get the home-page data
router.get('/home', getHomeData)

// Create/Edit the Profile
router.post('/profile/edit', upload.single('image'), createProfile)

//Get the profile data
router.get('/profile/:user_id', getProfileData)

//Update Profile data
router.patch('/profile/edit/:user_id', upload.single('image'), updateProfile)

// Transaction Routes

// Deal Listing
router.post('/transaction/listing', createListing)

module.exports = router