const express = require("express")
const router = express.Router()
const requireAuth = require("../middleware/requireAuth")
const upload = require("../middleware/uploadFile")
const { 
    getHomeData,
    getProfileData,
    createProfile
    } = require("../controllers/appController")

//using auth for the following
router.use(requireAuth)


//Get the home-page data
router.get('/home', getHomeData)

// Create/Edit the Profile
router.post('/profile/edit', upload.single('image'), createProfile)

//Get the profile data
router.get('/profile', getProfileData)

module.exports = router